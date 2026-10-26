/**
 * JSON request helper. Fail hone par readable message ke saath Error throw karta hai.
 */
export async function sendJson(method, url, data) {
  let response;

  try {
    response = await fetch(url, {
      method,
      headers:
        data === undefined ? undefined : { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw new Error(
      "Network error. Please check your connection and try again.",
    );
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? "Something went wrong. Please try again.",
    );
  }

  return body;
}

export const postJson = (url, data) => sendJson("POST", url, data);
