import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ConflictError, NotFoundError } from "@amb-app/shared";
import { MessageBusError } from "@amb-app/sdk";

type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  const body: ErrorBody = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof NotFoundError) {
    return jsonError(404, "not_found", error.message);
  }

  if (error instanceof ConflictError) {
    return jsonError(409, "conflict", error.message);
  }

  if (error instanceof MessageBusError) {
    return jsonError(error.status, error.code, error.message);
  }

  if (error instanceof ZodError) {
    return jsonError(400, "invalid_request", "Invalid request body", error.flatten());
  }

  return jsonError(500, "internal_error", "Unexpected error");
}
