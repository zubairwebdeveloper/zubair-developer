import "server-only";

export class EmailSendError extends Error {
  /** kind: "network" | "auth" | "rejected" | "provider" */
  constructor(
    kind,
    message = "The email provider could not send the message.",
  ) {
    super(message);
    this.name = "EmailSendError";
    this.kind = kind;
  }
}

export const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM);

/**
 * Resend REST API. Provider badalna ho to sirf yahi function badlen.
 * idempotencyKey: same key par provider dobara email nahi bhejta (kuch ghanton tak).
 */
export async function sendWithProvider({
  to,
  subject,
  text,
  html,
  idempotencyKey,
}) {
  let response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
        ...(process.env.EMAIL_REPLY_TO
          ? { reply_to: process.env.EMAIL_REPLY_TO }
          : {}),
      }),
    });
  } catch {
    throw new EmailSendError("network");
  }

  if (response.ok) return;

  if (response.status === 401 || response.status === 403)
    throw new EmailSendError("auth");
  if (response.status === 429 || response.status >= 500)
    throw new EmailSendError("provider");
  throw new EmailSendError("rejected");
}
