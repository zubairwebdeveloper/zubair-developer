import "server-only";

import { createHash } from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { errorResponse } from "@/lib/security/request-validation";

const memory = new Map(); // Sirf local development ke liye.
const limiters = new Map();
let redis = null;
let warned = false;

function getRedis() {
  const url = process.env.RATE_LIMIT_REDIS_URL;
  const token = process.env.RATE_LIMIT_REDIS_TOKEN;
  if (!url || !token) return null;
  redis ??= new Redis({ url, token });
  return redis;
}

export const isDurableRateLimitConfigured = () => Boolean(getRedis());

function memoryLimit(key, limit, windowSeconds) {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [entryKey, entry] of memory)
      if (entry.resetAt <= now) memory.delete(entryKey);
  }

  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > limit)
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  return { ok: true };
}

/**
 * @param {{ name: string, id: string, limit: number, windowSeconds: number, strict?: boolean }} options
 * strict = true: durable store na ho ya fail ho to request reject (AI ke liye).
 * strict = false: aise ma request allow (forms ke liye).
 */
export async function rateLimit({
  name,
  id,
  limit,
  windowSeconds,
  strict = false,
}) {
  const client = getRedis();

  if (!client) {
    if (process.env.NODE_ENV !== "production")
      return memoryLimit(`${name}:${id}`, limit, windowSeconds);
    if (strict) return { ok: false, unavailable: true, retryAfter: 60 };
    if (!warned) {
      warned = true;
      console.warn(
        "[rate-limit] Redis is not configured. Non-strict limits are skipped.",
      );
    }
    return { ok: true };
  }

  try {
    const cacheKey = `${name}:${limit}:${windowSeconds}`;
    let limiter = limiters.get(cacheKey);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix: `zd:${name}`,
      });
      limiters.set(cacheKey, limiter);
    }

    const result = await limiter.limit(id);
    if (result.success) return { ok: true };
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("[rate-limit] check failed:", error);
    return strict
      ? { ok: false, unavailable: true, retryAfter: 30 }
      : { ok: true };
  }
}

/** IP ko hash karke key banata hai (raw IP store nahi hoti). Vercel par x-real-ip platform set karta hai. */
export function getClientId(request) {
  const raw =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

export function rateLimitResponse(result) {
  if (result.unavailable) {
    return errorResponse(
      "RATE_LIMIT_UNAVAILABLE",
      "This service is temporarily unavailable. Please try again later.",
      503,
    );
  }

  const response = errorResponse(
    "RATE_LIMITED",
    "Too many requests. Please wait a moment and try again.",
    429,
  );
  response.headers.set("Retry-After", String(result.retryAfter ?? 60));
  return response;
}
