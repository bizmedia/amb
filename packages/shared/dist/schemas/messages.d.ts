import { z } from "zod";
export declare const sendMessageSchema: z.ZodObject<{
    threadId: z.ZodString;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    payload: z.ZodUnknown;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const messageIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const inboxQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=messages.d.ts.map