import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { success } from "@/utils/ApiResponse";
import { RequestOtpInput, VerifyOtpInput, RefreshTokenInput } from "./auth.validators";

export const authController = {
  async requestOtp(req: Request<{}, {}, RequestOtpInput>, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestLoginOtp(req.body.phoneNumber);
      return success(res, result, "تم إرسال كود التحقق");
    } catch (err) {
      next(err);
    }
  },

  async verifyOtp(req: Request<{}, {}, VerifyOtpInput>, res: Response, next: NextFunction) {
    try {
      const deviceInfo = req.headers["user-agent"];
      const result = await authService.verifyLoginOtp(
        req.body.phoneNumber,
        req.body.code,
        req.body.fullName,
        deviceInfo
      );
      return success(res, result, "تم تسجيل الدخول بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request<{}, {}, RefreshTokenInput>, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken);
      return success(res, result, "تم تجديد الجلسة");
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request<{}, {}, RefreshTokenInput>, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.body.refreshToken);
      return success(res, {}, "تم تسجيل الخروج بنجاح");
    } catch (err) {
      next(err);
    }
  },
};