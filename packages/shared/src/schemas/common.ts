import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const projectIdSchema = z.string().uuid();
