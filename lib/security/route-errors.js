import { errorResponse } from "@/lib/security/request-validation";
import {
  ConflictError,
  InvalidFileError,
  NotConfiguredError,
  NotFoundError,
  TransitionError,
  AiProviderError,
} from "@/lib/utils/errors";

export function handleRouteError(error, context) {
  if (error instanceof NotFoundError)
    return errorResponse("NOT_FOUND", error.message, 404);
  if (error instanceof TransitionError) {
    return errorResponse("INVALID_TRANSITION", error.message, 409);
  }
  if (error instanceof ConflictError)
    return errorResponse("CONFLICT", error.message, 409);
  if (error instanceof InvalidFileError)
    return errorResponse("INVALID_FILE", error.message, 422);
    if (error instanceof AiProviderError) {
      return errorResponse(
        "AI_UNAVAILABLE",
        "The assistant is unavailable right now. Please use the contact form instead.",
        503,
      );
    }
  if (error instanceof NotConfiguredError) {
    return errorResponse(
      "NOT_CONFIGURED",
      "This feature is not configured.",
      503,
    );
    
  }

  console.error(`[${context}] failed:`, error);
  return errorResponse(
    "SERVER_ERROR",
    "Something went wrong. Please try again.",
    500,
  );
}
