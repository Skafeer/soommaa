import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { AppError } from "@/middlewares/errorHandler";
import { UserRole } from "@prisma/client";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("يجب تسجيل الدخول للوصول إلى هذا المورد", 401));
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    next(new AppError("جلسة الدخول غير صالحة أو منتهية", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("لا تملك صلاحية الوصول لهذا المورد", 403));
    }
    next();
  };
}