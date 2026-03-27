import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@amb-app/db";
import { NotFoundError, ConflictError } from "@amb-app/shared";

const PRISMA_SCHEMA_DRIFT_CODES = new Set([
  "P2021", // table does not exist
  "P2022", // column does not exist
]);

function isZodError(e: unknown): e is { flatten: () => unknown } {
  return (
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    (e as { name: string }).name === "ZodError" &&
    "flatten" in e &&
    typeof (e as { flatten: unknown }).flatten === "function"
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "internal_error";
    let message = "Unexpected error";
    let details: unknown;

    if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = "not_found";
      message = exception.message;
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
      code = "conflict";
      message = exception.message;
    } else if (isZodError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      code = "invalid_request";
      message = "Invalid request body";
      details = exception.flatten();
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const meta =
        exception.meta !== undefined && exception.meta !== null
          ? JSON.stringify(exception.meta)
          : "";
      this.logger.error(
        `Prisma ${exception.code}: ${exception.message}${meta ? ` ${meta}` : ""}`,
      );
      if (PRISMA_SCHEMA_DRIFT_CODES.has(exception.code)) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = "database_schema_mismatch";
        message =
          "Database schema is out of date. From the repo root run: pnpm db:migrate:deploy";
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = "database_error";
        message = "Database request failed";
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      code = "http_error";
      if (typeof payload === "string") {
        message = payload;
      } else if (typeof payload === "object" && payload !== null) {
        const maybeMessage = (payload as { message?: unknown }).message;
        if (Array.isArray(maybeMessage)) {
          message = maybeMessage.join(", ");
        } else if (typeof maybeMessage === "string") {
          message = maybeMessage;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    }

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      !(exception instanceof Prisma.PrismaClientKnownRequestError)
    ) {
      this.logger.error(exception);
    }

    response.status(status).json({
      error: { code, message, ...(details ? { details } : {}) },
    });
  }
}
