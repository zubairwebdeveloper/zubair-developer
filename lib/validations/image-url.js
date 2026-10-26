/**
 * Sirf apne bucket ki `public/media/` wali images allowed hain.
 * Isse admin koi bhi random URL `next/image` ko nahi de sakta.
 */
export function isAllowedImageUrl(value) {
  if (!value) return true;
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) return false;
  return value.startsWith(
    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/public%2Fmedia%2F`,
  );
}
