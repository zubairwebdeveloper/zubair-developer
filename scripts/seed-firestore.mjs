import { FieldValue } from "firebase-admin/firestore";

import {
  seedFaqs,
  seedPlans,
  seedProcessSteps,
  seedServices,
  techStack,
} from "../config/content.seed.js";
import { db } from "./_firebase.mjs";

const firestore = db();

async function seedCollection(name, items, idKey) {
  const existing = await firestore.collection(name).limit(1).get();
  if (!existing.empty) {
    console.log(`- ${name}: skipped (already has data)`);
    return;
  }

  const batch = firestore.batch();
  items.forEach((item, index) => {
    const data = { ...item };
    const id = data[idKey];
    delete data.id;

    batch.set(firestore.collection(name).doc(id), {
      ...data,
      status: "published",
      order: index,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`- ${name}: seeded ${items.length}`);
}

await seedCollection("services", seedServices, "slug");
await seedCollection("pricingPlans", seedPlans, "slug");
await seedCollection("faqs", seedFaqs, "id");

const settingsRef = firestore.collection("siteSettings").doc("public");
if ((await settingsRef.get()).exists) {
  console.log("- siteSettings/public: skipped (already exists)");
} else {
  await settingsRef.set({
    announcement: { enabled: false },
    processSteps: seedProcessSteps,
    techStack,
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log("- siteSettings/public: created");
}

console.log(
  "Done. Projects ko jaanboojh kar seed nahi kiya (koi fake data nahi).",
);
