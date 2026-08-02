import { Request, Response, NextFunction } from "express";
import { locationService } from "./location.service";
import { success } from "@/utils/ApiResponse";

export const locationController = {
  async listGovernorates(_req: Request, res: Response, next: NextFunction) {
    try {
      const governorates = await locationService.listGovernorates();
      return success(res, governorates, "تم جلب المحافظات بنجاح");
    } catch (err) {
      next(err);
    }
  },
};