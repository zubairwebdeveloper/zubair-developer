import { beforeEach, describe, expect, it, vi } from "vitest";

const { fake } = vi.hoisted(() => {
  const store = new Map();
  let counter = 0;

  const docRef = (collection, id) => {
    const docId = id ?? `auto${++counter}`;
    const path = `${collection}/${docId}`;
    return {
      id: docId,
      path,
      get: async () => ({
        exists: store.has(path),
        data: () => store.get(path),
      }),
    };
  };

  const db = {
    collection: (name) => ({ doc: (id) => docRef(name, id) }),
    batch: () => {
      const ops = [];
      return {
        set: (ref, data) => ops.push({ op: "set", ref, data }),
        create: (ref, data) => ops.push({ op: "create", ref, data }),
        commit: async () => {
          for (const { op, ref } of ops) {
            if (op === "create" && store.has(ref.path)) {
              throw Object.assign(new Error("already exists"), { code: 6 });
            }
          }
          ops.forEach(({ ref, data }) => store.set(ref.path, data));
        },
      };
    },
  };

  return { fake: { store, db } };
});

vi.mock("@/lib/firebase/admin", () => ({ getAdminDb: () => fake.db }));

import { createInquiry } from "@/services/inquiries.service";

const keys = (prefix) =>
  [...fake.store.keys()].filter((key) => key.startsWith(prefix));

const contact = {
  type: "contact",
  source: "website_contact",
  name: "Eve",
  email: "eve@example.com",
  subject: "Hello",
  service: "web-development",
  message: "A long enough message for the form.",
  consent: true,
};

const brief = {
  type: "project_brief",
  source: "website_form",
  name: "Eve",
  email: "eve@example.com",
  businessType: "Clinic",
  service: "web-development",
  planSlug: "",
  description: "A website for my clinic.",
  budget: "200-500",
  timeline: "1-month",
  contactMethod: "email",
  consent: true,
};

beforeEach(() => fake.store.clear());

describe("createInquiry", () => {
  it("saves a contact message with a notification and an audit log, but no lead", async () => {
    const result = await createInquiry(contact);

    expect(result.reference).toMatch(/^ZD-[0-9A-F]{8}$/);
    expect(keys("inquiries/")).toHaveLength(1);
    expect(keys("notifications/")).toHaveLength(1);
    expect(keys("activityLogs/")).toHaveLength(1);
    expect(keys("leads/")).toHaveLength(0);
  });

  it("also creates a lead (same id as the inquiry) for project briefs", async () => {
    const result = await createInquiry(brief);

    expect(keys("leads/")).toEqual([`leads/${result.id}`]);
    expect(fake.store.get(`leads/${result.id}`)).toMatchObject({
      status: "new",
      reference: result.reference,
    });
  });

  it("stores consent as a fact, not the raw form flag, and keeps no submission id", async () => {
    const result = await createInquiry({
      ...contact,
      submissionId: "123e4567-e89b-12d3-a456-426614174000",
    });
    const stored = fake.store.get(`inquiries/${result.id}`);

    expect(stored.consentGiven).toBe(true);
    expect(stored).not.toHaveProperty("consent");
    expect(stored).not.toHaveProperty("submissionId");
  });

  it("returns the original inquiry when the same submission id is sent twice", async () => {
    const payload = {
      ...brief,
      submissionId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const first = await createInquiry(payload);
    const second = await createInquiry(payload);

    expect(second).toMatchObject({
      id: first.id,
      reference: first.reference,
      duplicate: true,
    });
    expect(keys("inquiries/")).toHaveLength(1);
    expect(keys("leads/")).toHaveLength(1);
    expect(keys("notifications/")).toHaveLength(1);
  });

  it("treats different submission ids as different inquiries", async () => {
    await createInquiry({
      ...contact,
      submissionId: "aaaaaaaa-1111-2222-3333-444444444444",
    });
    await createInquiry({
      ...contact,
      submissionId: "bbbbbbbb-1111-2222-3333-444444444444",
    });
    expect(keys("inquiries/")).toHaveLength(2);
  });

  it("uses a distinct notification type for AI leads", async () => {
    await createInquiry({ ...brief, source: "website_ai" });
    const [notification] = [...fake.store.entries()].filter(([key]) =>
      key.startsWith("notifications/"),
    );
    expect(notification[0]).toContain("new_ai_lead");
  });
});
