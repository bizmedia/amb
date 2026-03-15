import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, value: string): boolean {
  const parts = value.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const [, salt, expectedHashHex] = parts;
  if (!salt || !expectedHashHex) {
    return false;
  }

  const expectedHash = Buffer.from(expectedHashHex, "hex");
  const actualHash = Buffer.from(scryptSync(password, salt, expectedHash.length));
  if (expectedHash.length !== actualHash.length) {
    return false;
  }
  return timingSafeEqual(expectedHash, actualHash);
}
