import { db } from "./_firebase.mjs";

// Firestore batch ki hadd 500 writes hai.
const snapshot = await db().collection("leads").limit(500).get();
const batch = db().batch();
let count = 0;

snapshot.docs.forEach((doc) => {
  const data = doc.data();
  if (data.emailLower || !data.email) return;

  batch.update(doc.ref, { emailLower: String(data.email).toLowerCase() });
  count += 1;
});

if (count > 0) await batch.commit();
console.log(
  `Backfilled ${count} lead(s).${snapshot.size === 500 ? " Zyada leads ho sakti hain, dobara chalayen." : ""}`,
);
