import { describe, expect, it } from "vitest";

import { followUpDigestEmail, newInquiryEmail } from "@/lib/email/templates";

describe("email templates", () => {
  const base = {
    type: "contact",
    reference: "ZD-1",
    name: "Eve",
    email: "eve@example.com",
    service: "web-development",
  };

  it("escapes visitor text in HTML", () => {
    const email = newInquiryEmail({
      ...base,
      name: '<img src=x onerror="alert(1)">',
    });
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
    expect(email.html).toContain("&quot;");
  });

  it("strips newlines from the subject (header injection)", () => {
    const email = newInquiryEmail({
      ...base,
      reference: "ZD-1\r\nBcc: attacker@example.com",
    });
    expect(email.subject).not.toMatch(/[\r\n]/);
  });

  it("never includes the message body", () => {
    const email = newInquiryEmail({ ...base, message: "SECRET BODY" });
    expect(email.text).not.toContain("SECRET BODY");
    expect(email.html).not.toContain("SECRET BODY");
  });

  it("pluralises the follow-up digest subject", () => {
    const lead = { name: "A", reference: "ZD-1", dueAt: Date.UTC(2026, 0, 5) };
    expect(followUpDigestEmail([lead]).subject).toBe("1 follow-up due");
    expect(followUpDigestEmail([lead, lead]).subject).toBe("2 follow-ups due");
  });
});
