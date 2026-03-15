import { ApiHttpError } from "@/lib/api/http";

type Translate = (key: string) => string;

const CODE_TO_KEY: Record<string, string> = {
  unauthorized: "apiErrors.unauthorized",
  forbidden: "apiErrors.forbidden",
  service_unavailable: "apiErrors.serviceUnavailable",
  invalid_json: "apiErrors.invalidJson",
  invalid_request: "apiErrors.invalidRequest",
  invalid_params: "apiErrors.invalidParams",
  invalid_project_id: "apiErrors.invalidProjectId",
  project_not_found: "apiErrors.projectNotFound",
  auth_failed: "apiErrors.authFailed",
  invalid_auth_response: "apiErrors.invalidAuthResponse",
  not_found: "apiErrors.notFound",
  conflict: "apiErrors.conflict",
  internal_error: "apiErrors.internalError",
  http_error: "apiErrors.httpError",
};

export function getLocalizedApiErrorMessage(
  error: unknown,
  tCommon: Translate
): string {
  if (error instanceof ApiHttpError) {
    const key = CODE_TO_KEY[error.code];
    if (key) return tCommon(key);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return tCommon("apiErrors.unknown");
}

export function getLocalizedApiErrorFromCode(
  code: string | undefined,
  tCommon: Translate
): string {
  const key = code ? CODE_TO_KEY[code] : undefined;
  return key ? tCommon(key) : tCommon("apiErrors.unknown");
}
