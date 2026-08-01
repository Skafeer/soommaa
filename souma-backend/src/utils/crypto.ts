import crypto from "node:crypto";

export function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function generateSecureToken(): string {
  return crypto.randomBytes(48).toString("hex");
}