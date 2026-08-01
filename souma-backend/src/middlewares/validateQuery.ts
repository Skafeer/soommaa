import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { failure } from "@/utils/ApiResponse";

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
      return failure(res, "معايير البحث غير صحيحة", errors, 422);
    }
    req.query = result.data as any;
    next();
  };
}