import { z } from "zod";
export declare const taskPrefixSchema: z.ZodString;
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    taskPrefix: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    taskPrefix: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=projects.d.ts.map