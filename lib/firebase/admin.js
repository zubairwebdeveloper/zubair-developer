import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { NotConfiguredError } from "@/lib/utils/errors";

function getCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const credentials = getCredentials();
  if (!credentials) {
    throw new NotConfiguredError("Firebase Admin credentials are missing.");
  }

  return initializeApp({
    credential: cert(credentials),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  if (!globalThis.__zdFirestore) {
    const db = getFirestore(getAdminApp());
    db.settings({ ignoreUndefinedProperties: true });
    globalThis.__zdFirestore = db;
  }
  return globalThis.__zdFirestore;
}

export function getAdminBucket() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    throw new NotConfiguredError("Firebase Storage bucket is not configured.");
  }
  return getStorage(getAdminApp()).bucket();
}
