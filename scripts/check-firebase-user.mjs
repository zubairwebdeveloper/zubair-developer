import { auth } from "./_firebase.mjs";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    "Usage: node scripts/check-firebase-user.mjs email@example.com",
  );
  process.exit(1);
}

try {
  const user = await auth().getUserByEmail(email);

  console.log({
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    disabled: user.disabled,
  });
} catch (error) {
  console.error("Firebase error:", error.code, error.message);
  process.exitCode = 1;
}
