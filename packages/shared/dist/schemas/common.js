"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectIdSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
exports.uuidSchema = zod_1.z.string().uuid();
exports.projectIdSchema = zod_1.z.string().uuid();
