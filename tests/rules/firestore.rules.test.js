import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, it } from "vitest";

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-zd",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const seed = {
      "services/live": { title: "Live", status: "published" },
      "services/hidden": { title: "Hidden", status: "draft" },
      "pricingPlans/live": { name: "Live", status: "published" },
      "projects/hidden": { title: "Hidden", status: "draft" },
      "blogPosts/live": { title: "Live", status: "published" },
      "blogPosts/draft": { title: "Draft", status: "draft" },
      "faqs/live": { question: "Q", status: "published" },
      "siteSettings/public": { announcement: { enabled: false } },
      "siteSettings/notifications": { recipients: ["owner@example.com"] },
      "leads/l1": { name: "Private", email: "p@example.com" },
      "inquiries/i1": { message: "Private" },
      "adminUsers/a1": { role: "SUPER_ADMIN" },
      "notifications/n1": { title: "x" },
      "activityLogs/log1": { action: "x" },
      "aiSettings/config": { extraInstructions: "secret" },
      "aiConversations/c1": { messages: [] },
      "emailEvents/e1": { payload: { to: ["a@example.com"] } },
    };
    for (const [path, data] of Object.entries(seed))
      await setDoc(doc(db, path), data);
  });
});

afterAll(() => env?.cleanup());

const anonymous = () => env.unauthenticatedContext().firestore();
const signedIn = () =>
  env.authenticatedContext("some-user", { admin: true }).firestore();

describe("public reads", () => {
  it("allows reading published content", async () => {
    const db = anonymous();
    await assertSucceeds(getDoc(doc(db, "services/live")));
    await assertSucceeds(getDoc(doc(db, "pricingPlans/live")));
    await assertSucceeds(getDoc(doc(db, "blogPosts/live")));
    await assertSucceeds(getDoc(doc(db, "faqs/live")));
    await assertSucceeds(getDoc(doc(db, "siteSettings/public")));
  });

  it("blocks drafts", async () => {
    const db = anonymous();
    await assertFails(getDoc(doc(db, "services/hidden")));
    await assertFails(getDoc(doc(db, "projects/hidden")));
    await assertFails(getDoc(doc(db, "blogPosts/draft")));
  });

  it("only allows list queries that are restricted to published content", async () => {
    const db = anonymous();
    await assertSucceeds(
      getDocs(
        query(collection(db, "services"), where("status", "==", "published")),
      ),
    );
    await assertFails(getDocs(collection(db, "services")));
  });
});

describe("private data", () => {
  const privatePaths = [
    "leads/l1",
    "inquiries/i1",
    "adminUsers/a1",
    "notifications/n1",
    "activityLogs/log1",
    "aiSettings/config",
    "aiConversations/c1",
    "emailEvents/e1",
    "siteSettings/notifications",
  ];

  it.each(privatePaths)("denies anonymous reads of %s", async (path) => {
    await assertFails(getDoc(doc(anonymous(), path)));
  });

  it.each(privatePaths)(
    "denies reads of %s even when signed in (claims are not trusted)",
    async (path) => {
      await assertFails(getDoc(doc(signedIn(), path)));
    },
  );
});

describe("writes", () => {
  it("denies all client writes, anonymous or signed in", async () => {
    for (const db of [anonymous(), signedIn()]) {
      await assertFails(
        setDoc(doc(db, "services/live"), {
          status: "published",
          title: "Hacked",
        }),
      );
      await assertFails(
        updateDoc(doc(db, "services/live"), { title: "Hacked" }),
      );
      await assertFails(deleteDoc(doc(db, "services/live")));
      await assertFails(setDoc(doc(db, "leads/new"), { name: "Spam" }));
      await assertFails(setDoc(doc(db, "inquiries/new"), { message: "Spam" }));
      await assertFails(
        setDoc(doc(db, "adminUsers/me"), { role: "SUPER_ADMIN" }),
      );
      await assertFails(
        setDoc(doc(db, "siteSettings/public"), {
          announcement: { enabled: true },
        }),
      );
    }
  });
});
