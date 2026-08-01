import { Response } from "express";

export function success(res: Response, data: unknown = {}, message = "تمت العملية بنجاح", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function failure(res: Response, message = "حدث خطأ", errors: unknown[] = [], status = 400) {
  return res.status(status).json({ success: false, message, errors });
}