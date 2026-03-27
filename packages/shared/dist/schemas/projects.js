"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = exports.taskPrefixSchema = void 0;
const zod_1 = require("zod");
exports.taskPrefixSchema = zod_1.z
    .string()
    .regex(/^[A-Z]{2,5}$/, "Must be 2-5 uppercase Latin letters");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(80),
    taskPrefix: exports.taskPrefixSchema.optional(),
});
exports.updateProjectSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(80).optional(),
    taskPrefix: exports.taskPrefixSchema.optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
