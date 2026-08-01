import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { validate } from "@/middlewares/validate";
import { requestOtpSchema, verifyOtpSchema, refreshTokenSchema } from "./auth.validators";

const router = Router();

const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "عدد كبير من المحاولات، يرجى المحاولة لاحقاً",
    errors: [],
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/otp/request", otpRequestLimiter, validate(requestOtpSchema), authController.requestOtp);
router.post("/otp/verify", otpVerifyLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", validate(refreshTokenSchema), authController.logout);

export default router;