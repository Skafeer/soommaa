import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { generateOtpCode, hashValue } from "@/utils/crypto";
import { OtpPurpose } from "@prisma/client";

const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

export const otpService = {
  async requestOtp(phoneNumber: string, purpose: OtpPurpose) {
    const lastOtp = await prisma.otpVerification.findFirst({
      where: { phoneNumber, purpose },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
        throw new AppError(`يرجى الانتظار ${waitSeconds} ثانية قبل طلب كود جديد`, 429);
      }
    }

    const code = generateOtpCode();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.create({
      data: { phoneNumber, codeHash, purpose, expiresAt },
    });

    await this.sendSms(phoneNumber, code);

    return process.env.NODE_ENV === "development" ? { devCode: code } : {};
  },

  async verifyOtp(phoneNumber: string, code: string, purpose: OtpPurpose): Promise<void> {
    const otp = await prisma.otpVerification.findFirst({
      where: { phoneNumber, purpose, verifiedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      throw new AppError("لم يتم طلب كود تحقق لهذا الرقم", 400);
    }

    if (otp.expiresAt < new Date()) {
      throw new AppError("انتهت صلاحية كود التحقق، يرجى طلب كود جديد", 400);
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AppError("تم تجاوز عدد المحاولات المسموح، يرجى طلب كود جديد", 429);
    }

    if (otp.codeHash !== hashValue(code)) {
      await prisma.otpVerification.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError("كود التحقق غير صحيح", 400);
    }

    await prisma.otpVerification.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });
  },

  async sendSms(phoneNumber: string, code: string): Promise<void> {
    console.log(`📱 [DEV OTP] إرسال الكود ${code} إلى ${phoneNumber}`);
  },
};