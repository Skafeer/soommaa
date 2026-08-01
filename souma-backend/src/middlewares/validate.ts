import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { failure } from "@/utils/ApiResponse";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return failure(res, "بيانات غير صحيحة", errors, 422);
    }

    req.body = result.data;
    next();
  };
}