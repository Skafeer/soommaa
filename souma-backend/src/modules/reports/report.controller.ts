import { Request, Response, NextFunction } from "express";
import { reportService } from "./report.service";
import { success } from "@/utils/ApiResponse";
import { CreateReportInput, ResolveReportInput } from "./report.validators";

export const reportController = {
  async create(req: Request<{}, {}, CreateReportInput>, res: Response, next: NextFunction) {
    try {
      const report = await reportService.create(req.user!.userId, req.body);
      return success(res, report, "تم إرسال البلاغ بنجاح، شكراً لمساهمتك بالحفاظ على جودة المنصة", 201);
    } catch (err) {
      next(err);
    }
  },

  async listPending(_req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await reportService.listPending();
      return success(res, reports, "تم جلب البلاغات قيد المراجعة");
    } catch (err) {
      next(err);
    }
  },

  async resolve(req: Request<{ id: string }, {}, ResolveReportInput>, res: Response, next: NextFunction) {
    try {
      const report = await reportService.resolve(req.user!.userId, req.params.id, req.body.status);
      return success(res, report, "تم تحديث حالة البلاغ بنجاح");
    } catch (err) {
      next(err);
    }
  },
};