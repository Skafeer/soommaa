import { Request, Response, NextFunction } from "express";
import { advertisementService } from "./advertisement.service";
import { advertisementImageService } from "./advertisement.image.service";
import { AppError } from "@/middlewares/errorHandler";
import { success } from "@/utils/ApiResponse";
import {
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
  RejectAdvertisementInput,
  ListAdvertisementsQuery,
} from "./advertisement.validators";

export const advertisementController = {
  async create(req: Request<{}, {}, CreateAdvertisementInput>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.create(req.user!.userId, req.body);
      return success(res, ad, "تم إنشاء الإعلان كمسودة بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request<{ id: string }, {}, UpdateAdvertisementInput>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.update(req.user!.userId, req.params.id, req.body);
      return success(res, ad, "تم تحديث الإعلان بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async submitForReview(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.submitForReview(req.user!.userId, req.params.id);
      return success(res, ad, "تم إرسال الإعلان للمراجعة بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async markAsSold(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.markAsSold(req.user!.userId, req.params.id);
      return success(res, ad, "تم تحديد الإعلان كمباع");
    } catch (err) {
      next(err);
    }
  },

  async renew(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.renew(req.user!.userId, req.params.id);
      return success(res, ad, "تم إرسال الإعلان للمراجعة لتجديده");
    } catch (err) {
      next(err);
    }
  },

  async getPublicById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.getPublicById(req.params.id);
      return success(res, ad, "تم جلب الإعلان بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ListAdvertisementsQuery;
      const result = await advertisementService.list(query);
      return success(res, result, "تم جلب الإعلانات بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const ads = await advertisementService.listMine(req.user!.userId);
      return success(res, ads, "تم جلب إعلاناتك بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async uploadImages(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError("يجب إرفاق صورة واحدة على الأقل", 422);
      }
      const images = await advertisementImageService.addImages(req.user!.userId, req.params.id, files);
      return success(res, images, "تم رفع الصور بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteImage(req: Request<{ id: string; imageId: string }>, res: Response, next: NextFunction) {
    try {
      await advertisementImageService.deleteImage(req.user!.userId, req.params.id, req.params.imageId);
      return success(res, {}, "تم حذف الصورة بنجاح");
    } catch (err) {
      next(err);
    }
  },

  // ==== أدمن ====

  async listPendingReview(_req: Request, res: Response, next: NextFunction) {
    try {
      const ads = await advertisementService.listPendingReview();
      return success(res, ads, "تم جلب الإعلانات قيد المراجعة");
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.approve(req.user!.userId, req.params.id);
      return success(res, ad, "تم قبول الإعلان ونشره بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request<{ id: string }, {}, RejectAdvertisementInput>, res: Response, next: NextFunction) {
    try {
      const ad = await advertisementService.reject(req.user!.userId, req.params.id, req.body.reason);
      return success(res, ad, "تم رفض الإعلان");
    } catch (err) {
      next(err);
    }
  },
};