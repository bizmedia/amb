export class NotFoundError extends Error {
  readonly resource: string;

  constructor(resource: string, message?: string) {
    super(message ?? `${resource} not found`);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}
