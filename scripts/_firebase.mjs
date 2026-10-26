import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const APP_NAME = "zubair-developer-admin-scripts";

function getApp() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  ).trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.",
    );
  }

  // Detect accidental mismatch between Client SDK and Admin SDK projects.
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  if (clientProjectId && clientProjectId !== projectId) {
    throw new Error(
      `Firebase project mismatch: Admin SDK uses "${projectId}", but Client SDK uses "${clientProjectId}". Update .env.local so both use the same Firebase project.`,
    );
  }

  // Reuse only this script's named app, not an arbitrary initialized app.
  const existingApp = getApps().find((app) => app.name === APP_NAME);

  if (existingApp) {
    if (existingApp.options.projectId !== projectId) {
      throw new Error(
        `Existing Admin SDK app uses "${existingApp.options.projectId}", expected "${projectId}".`,
      );
    }

    return existingApp;
  }

  const app = initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    },
    APP_NAME,
  );

  console.log(`Firebase Admin SDK project: ${projectId}`);

  return app;
}

let appInstance;

function getFirebaseApp() {
  if (!appInstance) {
    appInstance = getApp();
  }

  return appInstance;
}

export const db = () => getFirestore(getFirebaseApp());
export const auth = () => getAuth(getFirebaseApp());
