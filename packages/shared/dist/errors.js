"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    resource;
    constructor(resource, message) {
        super(message ?? `${resource} not found`);
        this.name = "NotFoundError";
        this.resource = resource;
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    resource;
    constructor(resource, message) {
        super(message ?? `${resource} state conflict`);
        this.name = "ConflictError";
        this.resource = resource;
    }
}
exports.ConflictError = ConflictError;
