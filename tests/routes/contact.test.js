import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/inquiries.service", () => ({ createInquiry: vi.fn() }));
vi.mock("@/lib/notifications/email-notifier", () => ({
  notifyNewInquiry: vi.fn(),
}));
vi.mock("@/lib/security/rate-limit", async (importOriginal) => ({
  ...(await importOriginal()),
  rateLimit: vi.fn(),
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal()),
  after: vi.fn(),
}));

import { after } from "next/server";

import { POST } from "@/app/api/contact/route";
import { notifyNewInquiry } from "@/lib/notifications/email-notifier";
import { rateLimit } from "@/lib/security/rate-limit";
import { NotConfiguredError } from "@/lib/utils/errors";
import { createInquiry } from "@/services/inquiries.service";

const valid = {
  name: "Ayesha Khan",
  email: "ayesha@example.com",
  company: "",
  subject: "Website quote",
  service: "web-development",
  message: "I would like a quote for a small business website.",
  consent: true,
  companyUrl: "",
};

const call = (body, { origin = "http://localhost" } = {}) =>
  POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(origin ? { origin } : {}),
      },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  rateLimit.mockResolvedValue({ ok: true });
  createInquiry.mockResolvedValue({ id: "abc", reference: "ZD-ABCD1234" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/contact", () => {
  it("rejects cross-origin requests", async () => {
    expect((await call(valid, { origin: "http://evil.example" })).status).toBe(
      403,
    );
    expect(createInquiry).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    rateLimit.mockResolvedValue({ ok: false, retryAfter: 10 });
    expect((await call(valid)).status).toBe(429);
    expect(createInquiry).not.toHaveBeenCalled();
  });

  it("returns 422 with field errors for invalid input", async () => {
    const response = await call({ ...valid, email: "nope", message: "short" });
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.details.email).toBeDefined();
    expect(body.error.details.message).toBeDefined();
    expect(createInquiry).not.toHaveBeenCalled();
  });

  it("silently succeeds for bots but saves nothing", async () => {
    const response = await call({
      ...valid,
      companyUrl: "http://spam.example",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(createInquiry).not.toHaveBeenCalled();
  });

  it("saves the inquiry, returns the reference and schedules the email", async () => {
    const response = await call({
      ...valid,
      submissionId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      ok: true,
      id: "abc",
      reference: "ZD-ABCD1234",
    });

    const saved = createInquiry.mock.calls[0][0];
    expect(saved).toMatchObject({
      type: "contact",
      source: "website_contact",
      consent: true,
    });
    expect(saved).not.toHaveProperty("companyUrl");
    expect(saved.submissionId).toBe("123e4567-e89b-12d3-a456-426614174000");

    expect(after).toHaveBeenCalledTimes(1);
    after.mock.calls[0][0]();
    expect(notifyNewInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ id: "abc", type: "contact" }),
    );
  });

  it("is honest when storage is not configured", async () => {
    createInquiry.mockRejectedValue(new NotConfiguredError());
    const response = await call(valid);
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("NOT_CONFIGURED");
  });

  it("hides unexpected errors", async () => {
    createInquiry.mockRejectedValue(new Error("firestore secret path"));
    const response = await call(valid);
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});
