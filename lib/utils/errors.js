export class NotConfiguredError extends Error {
  constructor(message = "This feature is not configured.") {
    super(message);
    this.name = "NotConfiguredError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class TransitionError extends Error {
  constructor(message = "This status change is not allowed.") {
    super(message);
    this.name = "TransitionError";
  }
}

export class ConflictError extends Error {
  constructor(message = "This action conflicts with the current state.") {
    super(message);
    this.name = "ConflictError";
  }
}

export class InvalidFileError extends Error {
  constructor(message = "This file is not allowed.") {
    super(message);
    this.name = "InvalidFileError";
  }
}
export class AiProviderError extends Error {
  /** kind: "timeout" | "quota" | "auth" | "provider" | "empty" | "unknown" */
  constructor(
    kind,
    message = "The AI provider could not complete the request.",
  ) {
    super(message);
    this.name = "AiProviderError";
    this.kind = kind;
  }

  get retryable() {
    return this.kind === "timeout" || this.kind === "provider";
  }
}