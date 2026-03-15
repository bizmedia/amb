import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { NotFoundError, ConflictError } from "@amb-app/shared";

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
    } else if (typeof (exception as { statusCode?: number }).statusCode === "number") {
      const ex = exception as { statusCode: number; message?: string };
      status = ex.statusCode;
      message = ex.message ?? message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    response.status(status).json({
      error: { code, message, ...(details ? { details } : {}) },
    });
  }
}
