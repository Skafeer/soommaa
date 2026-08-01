import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { failure } from "@/utils/ApiResponse";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return failure(res, err.message, [], err.status);
  }
  if (err instanceof multer.MulterError) {
    return failure(res, `خطأ برفع الملف: ${err.message}`, [], 400);
  }
  console.error(err);
  return failure(res, "حدث خطأ غير متوقع في الخادم", [], 500);
}