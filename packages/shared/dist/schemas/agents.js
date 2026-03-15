"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentSchema = void 0;
const zod_1 = require("zod");
exports.createAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    role: zod_1.z.string().min(1),
    capabilities: zod_1.z.unknown().optional().nullable(),
});
