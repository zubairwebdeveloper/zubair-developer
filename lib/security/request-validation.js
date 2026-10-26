import { NextResponse } from "next/server";

export function errorResponse(code, message, status, details) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

/** CSRF defence: mutating requests sirf apni hi site se aani chahiye. */
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

/**
 * Request body ko parse + Zod se validate karta hai.
 * @returns {Promise<{ data: object } | { response: Response }>}
 */
export async function parseAndValidate(
  request,
  schema,
  { maxBytes = 20_000 } = {},
) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) {
    return {
      response: errorResponse(
        "PAYLOAD_TOO_LARGE",
        "Request is too large.",
        413,
      ),
    };
  }

  let json;
  try {
    json = await request.json();
  } catch {
    return {
      response: errorResponse("INVALID_JSON", "Invalid request body.", 400),
    };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      response: errorResponse(
        "VALIDATION_ERROR",
        "Please check the highlighted fields.",
        422,
        result.error.flatten().fieldErrors,
      ),
    };
  }

  return { data: result.data };
}
