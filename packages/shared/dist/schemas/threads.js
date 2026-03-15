"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadIdParamsSchema = exports.updateThreadSchema = exports.createThreadSchema = void 0;
const zod_1 = require("zod");
exports.createThreadSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    status: zod_1.z.enum(["open", "closed"]).optional().default("open"),
});
exports.updateThreadSchema = zod_1.z.object({
    status: zod_1.z.enum(["open", "closed", "archived"]),
});
exports.threadIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
