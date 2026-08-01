import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { normalizeIraqiPhone } from "@/utils/phone";
import { hashValue, generateSecureToken } from "@/utils/crypto";
import { signAccessToken } from "@/utils/jwt";
import { otpService } from "./otp.service";
import { OtpPurpose } from "@prisma/client";

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

async function issueTokenPair(userId: string, role: "USER" | "ADMIN" | "SUPER_ADMIN", deviceInfo?: string) {
  const accessToken = signAccessToken({ userId, role: role as any });

  const rawRefreshToken = generateSecureToken();
  const tokenHash = hashValue(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt, deviceInfo },
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export const authService = {
  async requestLoginOtp(phoneNumberRaw: string) {
    const phoneNumber = normalizeIraqiPhone(phoneNumberRaw);
    return otpService.requestOtp(phoneNumber, OtpPurpose.LOGIN);
  },

  async verifyLoginOtp(phoneNumberRaw: string, code: string, fullName: string | undefined, deviceInfo?: string) {
    const phoneNumber = normalizeIraqiPhone(phoneNumberRaw);

    await otpService.verifyOtp(phoneNumber, code, OtpPurpose.LOGIN);

    let user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      if (!fullName) {
        throw new AppError("الاسم الكامل مطلوب لإنشاء حساب جديد", 422);
      }
      user = await prisma.user.create({
        data: { phoneNumber, fullName, phoneVerifiedAt: new Date() },
      });
    } else if (!user.phoneVerifiedAt) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    if (user.accountStatus === "BANNED") {
      throw new AppError("هذا الحساب محظور، يرجى التواصل مع الدعم", 403);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await issueTokenPair(user.id, user.role, deviceInfo);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      ...tokens,
    };
  },

  async refreshTokens(rawRefreshToken: string) {
    const tokenHash = hashValue(rawRefreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AppError("جلسة الدخول غير صالحة، يرجى تسجيل الدخول مرة أخرى", 401);
    }

    if (stored.user.accountStatus === "BANNED") {
      throw new AppError("هذا الحساب محظور", 403);
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return issueTokenPair(stored.user.id, stored.user.role, stored.deviceInfo ?? undefined);
  },

  async logout(rawRefreshToken: string) {
    const tokenHash = hashValue(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};