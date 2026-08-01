import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AppError } from "@/middlewares/errorHandler";

export function normalizeIraqiPhone(input: string): string {
  const trimmed = input.trim();
  const parsed = parsePhoneNumberFromString(trimmed, "IQ");

  if (!parsed || !parsed.isValid()) {
    throw new AppError("رقم الهاتف غير صحيح", 422);
  }

  return parsed.number; // e.g. +9647701234567
}