import { describe, expect, it, vi } from "vitest";

import {
  briefDraftSchema,
  chatRequestSchema,
} from "@/lib/validations/ai.schema";
import { contactSchema } from "@/lib/validations/contact.schema";
import { planSchema, projectSchema } from "@/lib/validations/content.schema";
import { isAllowedImageUrl } from "@/lib/validations/image-url";
import { projectBriefSchema } from "@/lib/validations/inquiry.schema";
import { announcementSchema } from "@/lib/validations/settings.schema";

const validContact = {
  name: "Ayesha Khan",
  email: "ayesha@example.com",
  company: "",
  subject: "Website quote",
  service: "web-development",
  message: "I would like a quote for a small business website.",
  consent: true,
};

const validBrief = {
  name: "Ayesha Khan",
  email: "ayesha@example.com",
  businessType: "Clinic",
  service: "web-development",
  planSlug: "",
  description: "A website for my clinic with appointment requests.",
  features: "",
  budget: "200-500",
  timeline: "1-month",
  existingWebsite: "",
  contactMethod: "email",
  referenceLinks: "",
  consent: true,
};

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("rejects bad email, short message, unknown service and missing consent", () => {
    expect(
      contactSchema.safeParse({ ...validContact, email: "nope" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...validContact, message: "too short" })
        .success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...validContact, service: "hacking" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...validContact, consent: false }).success,
    ).toBe(false);
  });

  it("still validates when the honeypot is filled (route handles it silently)", () => {
    expect(
      contactSchema.safeParse({
        ...validContact,
        companyUrl: "http://spam.example",
      }).success,
    ).toBe(true);
  });

  it("validates the optional submission id format", () => {
    expect(
      contactSchema.safeParse({ ...validContact, submissionId: "abc" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        ...validContact,
        submissionId: "123e4567-e89b-12d3-a456-426614174000",
      }).success,
    ).toBe(true);
  });

  it("strips unknown fields", () => {
    const result = contactSchema.parse({ ...validContact, role: "ADMIN" });
    expect(result).not.toHaveProperty("role");
  });
});

describe("projectBriefSchema", () => {
  it("accepts a valid brief", () => {
    expect(projectBriefSchema.safeParse(validBrief).success).toBe(true);
  });

  it("rejects non-http(s) website URLs", () => {
    expect(
      projectBriefSchema.safeParse({
        ...validBrief,
        existingWebsite: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      projectBriefSchema.safeParse({
        ...validBrief,
        existingWebsite: "https://example.com",
      }).success,
    ).toBe(true);
  });

  it("requires budget, timeline, contact method and consent", () => {
    ["budget", "timeline", "contactMethod"].forEach((key) => {
      expect(
        projectBriefSchema.safeParse({ ...validBrief, [key]: "" }).success,
      ).toBe(false);
    });
    expect(
      projectBriefSchema.safeParse({ ...validBrief, consent: false }).success,
    ).toBe(false);
  });
});

describe("AI schemas", () => {
  it("turns invalid model output into empty strings instead of throwing", () => {
    const draft = briefDraftSchema.parse({
      service: "hacking",
      budget: 5,
      existingWebsite: "javascript:x",
    });
    expect(draft.service).toBe("");
    expect(draft.budget).toBe("");
    expect(draft.existingWebsite).toBe("");
    expect(briefDraftSchema.parse({})).toMatchObject({
      businessType: "",
      contactMethod: "",
    });
  });

  it("requires the last chat message to come from the visitor", () => {
    const base = { sessionId: "abcdefgh-1234" };
    const ok = chatRequestSchema.safeParse({
      ...base,
      messages: [{ role: "user", content: "hi" }],
    });
    const bad = chatRequestSchema.safeParse({
      ...base,
      messages: [{ role: "assistant", content: "hi" }],
    });
    expect(ok.success).toBe(true);
    expect(bad.success).toBe(false);
  });

  it("enforces message length, history size and session id format", () => {
    const base = { sessionId: "abcdefgh-1234" };
    const long = chatRequestSchema.safeParse({
      ...base,
      messages: [{ role: "user", content: "a".repeat(1001) }],
    });
    const many = chatRequestSchema.safeParse({
      ...base,
      messages: Array.from({ length: 11 }, () => ({
        role: "user",
        content: "hi",
      })),
    });
    const badSession = chatRequestSchema.safeParse({
      sessionId: "x y",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(long.success).toBe(false);
    expect(many.success).toBe(false);
    expect(badSession.success).toBe(false);
  });
});

describe("announcementSchema", () => {
  const base = {
    enabled: true,
    message: "Spring offer",
    href: "",
    linkLabel: "",
    startsAt: null,
    endsAt: null,
  };

  it("blocks dangerous links", () => {
    expect(
      announcementSchema.safeParse({ ...base, href: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(
      announcementSchema.safeParse({ ...base, href: "//evil.example" }).success,
    ).toBe(false);
    expect(
      announcementSchema.safeParse({ ...base, href: "/pricing" }).success,
    ).toBe(true);
    expect(
      announcementSchema.safeParse({ ...base, href: "https://example.com" })
        .success,
    ).toBe(true);
  });

  it("needs a message when enabled and a sensible schedule", () => {
    expect(announcementSchema.safeParse({ ...base, message: "" }).success).toBe(
      false,
    );
    expect(
      announcementSchema.safeParse({ ...base, enabled: false, message: "" })
        .success,
    ).toBe(true);
    expect(
      announcementSchema.safeParse({
        ...base,
        startsAt: "2026-02-01T00:00:00.000Z",
        endsAt: "2026-01-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("content schemas and image URLs", () => {
  const bucket = "demo.firebasestorage.app";
  const goodUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/public%2Fmedia%2Fabc.jpg?alt=media`;

  it("only allows images from our own media folder", () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", bucket);
    expect(isAllowedImageUrl("")).toBe(true);
    expect(isAllowedImageUrl(goodUrl)).toBe(true);
    expect(isAllowedImageUrl("https://evil.example/x.jpg")).toBe(false);
    expect(
      isAllowedImageUrl(
        `https://firebasestorage.googleapis.com/v0/b/other/o/public%2Fmedia%2Fa.jpg`,
      ),
    ).toBe(false);
  });

  it("rejects every image when no bucket is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "");
    expect(isAllowedImageUrl(goodUrl)).toBe(false);
  });

  it("validates project cover images and URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", bucket);
    const project = {
      title: "My App",
      summary: "A short summary here.",
      category: "Web app",
      coverImage: "",
      coverAlt: "",
      technologies: ["Next.js"],
      problem: "",
      solution: "",
      outcome: "",
      liveUrl: "",
      repoUrl: "",
      featured: false,
      status: "draft",
      order: 0,
    };
    expect(projectSchema.safeParse(project).success).toBe(true);
    expect(
      projectSchema.safeParse({
        ...project,
        coverImage: "https://evil.example/x.jpg",
      }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...project, liveUrl: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...project, status: "hacked" }).success,
    ).toBe(false);
  });

  it("requires at least one feature for a plan", () => {
    const plan = {
      category: "web",
      name: "Starter",
      price: 99,
      currency: "USD",
      isStartingPrice: true,
      billing: "one-time",
      badge: "",
      description: "A simple site.",
      features: [],
      excludes: [],
      ctaLabel: "Choose",
      status: "draft",
      order: 0,
    };
    expect(planSchema.safeParse(plan).success).toBe(false);
    expect(
      planSchema.safeParse({ ...plan, features: ["One page"] }).success,
    ).toBe(true);
    expect(
      planSchema.safeParse({ ...plan, features: ["One page"], price: -5 })
        .success,
    ).toBe(false);
  });
});
