import { Timestamp } from "firebase-admin/firestore";

import { db } from "./_firebase.mjs";

const snapshot = await db().collection("leads").limit(1000).get();
const now = Timestamp.now().toMillis();
const batch = db().batch();
let count = 0;

snapshot.docs.forEach((doc) => {
  const data = doc.data();
  if (!data.followUpAt || data.followUpReminded !== undefined) return;

  batch.update(doc.ref, {
    followUpReminded: data.followUpAt.toMillis() <= now,
  });
  count += 1;
});

if (count > 0) await batch.commit();
console.log(`Backfilled ${count} lead(s).`);
