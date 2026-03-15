import { createHmac } from "node:crypto";

export function hashProjectToken(token: string): string {
  return createHmac("sha256", "project-token-hash-v1").update(token).digest("hex");
}
