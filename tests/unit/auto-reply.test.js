import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/notification-settings.service", () => ({
  getNotificationPrefs: vi.fn(),
  resolveRecipients: vi.fn(() => ["owner@example.com"]),
}));
vi.mock("@/services/email.service", () => ({ deliverEmail: vi.fn() }));
vi.mock("@/lib/security/rate-limit", () => ({ rateLimit: vi.fn() }));

import { notifyNewInquiry } from "@/lib/notifications/email-notifier";
import { rateLimit } from "@/lib/security/rate-limit";
import { deliverEmail } from "@/services/email.service";
import { getNotificationPrefs } from "@/services/notification-settings.service";

const prefs = {
  emailEnabled: true,
  onNewInquiry: true,
  onFollowUpDue: true,
  recipients: [],
  autoReplyEnabled: true,
  autoReplyMessage: "Thanks, we will reply soon.",
};

const info = {
  id: "i1",
  reference: "ZD-ABCD1234",
  type: "contact",
  name: "Spam http://evil.example",
  email: "eve@example.com",
  service: "web-development",
};

beforeEach(() => {
  getNotificationPrefs.mockResolvedValue(prefs);
  rateLimit.mockResolvedValue({ ok: true });
  deliverEmail.mockResolvedValue({ status: "sent" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("auto-reply", () => {
  it("sends nothing when email notifications are off", async () => {
    getNotificationPrefs.mockResolvedValue({ ...prefs, emailEnabled: false });
    await notifyNewInquiry(info);
    expect(deliverEmail).not.toHaveBeenCalled();
  });

  it("only emails the owner when auto-reply is off", async () => {
    getNotificationPrefs.mockResolvedValue({
      ...prefs,
      autoReplyEnabled: false,
    });
    await notifyNewInquiry(info);

    expect(deliverEmail).toHaveBeenCalledTimes(1);
    expect(deliverEmail.mock.calls[0][0].to).toEqual(["owner@example.com"]);
  });

  it("replies to the visitor when enabled, with an idempotent key", async () => {
    await notifyNewInquiry(info);

    expect(deliverEmail).toHaveBeenCalledTimes(2);
    const reply = deliverEmail.mock.calls[1][0];
    expect(reply.to).toEqual(["eve@example.com"]);
    expect(reply.key).toBe("autoreply_i1");
    expect(reply.text).toContain("ZD-ABCD1234");
    expect(reply.text).toContain("Thanks, we will reply soon.");
  });

  it("never puts visitor-supplied text in the reply", async () => {
    await notifyNewInquiry(info);
    const reply = deliverEmail.mock.calls[1][0];

    expect(reply.text).not.toContain("evil.example");
    expect(reply.html).not.toContain("evil.example");
    expect(reply.subject).not.toContain("Spam");
  });

  it("escapes the owner's message in HTML", async () => {
    getNotificationPrefs.mockResolvedValue({
      ...prefs,
      autoReplyMessage: "<b>Hi</b> there friend",
    });
    await notifyNewInquiry(info);

    expect(deliverEmail.mock.calls[1][0].html).not.toContain("<b>");
  });

  it("skips the reply when the address is rate limited, but still notifies the owner", async () => {
    rateLimit.mockResolvedValue({ ok: false, retryAfter: 100 });
    await notifyNewInquiry(info);

    expect(deliverEmail).toHaveBeenCalledTimes(1);
    expect(rateLimit.mock.calls[0][0]).toMatchObject({
      name: "autoreply",
      strict: true,
      limit: 2,
    });
  });
});
