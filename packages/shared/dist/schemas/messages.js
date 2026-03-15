"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inboxQuerySchema = exports.messageIdParamsSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    threadId: zod_1.z.string().uuid(),
    fromAgentId: zod_1.z.string().uuid(),
    toAgentId: zod_1.z.string().uuid().optional().nullable(),
    payload: zod_1.z.unknown(),
    parentId: zod_1.z.string().uuid().optional().nullable(),
});
exports.messageIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.inboxQuerySchema = zod_1.z.object({
    agentId: zod_1.z.string().uuid(),
});
