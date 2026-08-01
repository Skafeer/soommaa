import { z } from "zod";

export const requestOtpSchema = z.object({
  phoneNumber: z.string().min(8, "رقم الهاتف مطلوب"),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(8, "رقم الهاتف مطلوب"),
  code: z.string().length(6, "كود التحقق يجب أن يتكون من 6 أرقام"),
  fullName: z.string().min(2, "الاسم مطلوب").max(100).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, "الرمز غير صالح"),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;