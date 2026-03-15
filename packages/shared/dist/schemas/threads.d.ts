import { z } from "zod";
export declare const createThreadSchema: z.ZodObject<{
    title: z.ZodString;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        open: "open";
        closed: "closed";
    }>>>;
}, z.core.$strip>;
export declare const updateThreadSchema: z.ZodObject<{
    status: z.ZodEnum<{
        open: "open";
        closed: "closed";
        archived: "archived";
    }>;
}, z.core.$strip>;
export declare const threadIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=threads.d.ts.map