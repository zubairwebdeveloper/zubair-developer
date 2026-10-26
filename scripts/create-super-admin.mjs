import { FieldValue } from "firebase-admin/firestore";

import { auth, db } from "./_firebase.mjs";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run admin:create -- you@example.com");
  process.exit(1);
}

try {
  const user = await auth().getUserByEmail(email);

  const adminRef = db().collection("adminUsers").doc(user.uid);

  const existing = await adminRef.get();

  if (existing.exists && existing.data()?.role === "SUPER_ADMIN") {
    console.log(`SUPER_ADMIN already exists for ${user.email}.`);
    process.exit(0);
  }

  await adminRef.set(
    {
      email: user.email,
      displayName: user.displayName ?? null,
      role: "SUPER_ADMIN",
      status: "active",
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`SUPER_ADMIN created for ${user.email} (${user.uid})`);
} catch (error) {
  if (error.code === "auth/user-not-found") {
    console.error(`No Firebase Auth user found for ${email}.`);
    console.error(
      "Create the account first, and verify that your Admin SDK targets the correct Firebase project.",
    );
  } else {
    console.error("Failed to create super-admin:", error.message);
  }

  process.exitCode = 1;
}
