import { Request, Response, NextFunction } from "express";
import { favoriteService } from "./favorite.service";
import { success } from "@/utils/ApiResponse";

export const favoriteController = {
  async add(req: Request<{ advertisementId: string }>, res: Response, next: NextFunction) {
    try {
      const favorite = await favoriteService.add(req.user!.userId, req.params.advertisementId);
      return success(res, favorite, "تم إضافة الإعلان للمفضلة", 201);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request<{ advertisementId: string }>, res: Response, next: NextFunction) {
    try {
      await favoriteService.remove(req.user!.userId, req.params.advertisementId);
      return success(res, {}, "تم إزالة الإعلان من المفضلة");
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const favorites = await favoriteService.list(req.user!.userId);
      return success(res, favorites, "تم جلب المفضلة بنجاح");
    } catch (err) {
      next(err);
    }
  },
};