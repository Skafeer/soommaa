import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";
import { success } from "@/utils/ApiResponse";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateAttributeOptionInput,
} from "./category.validators";

export const categoryController = {
  async listTree(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listTree();
      return success(res, categories, "تم جلب التصنيفات بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(req.params.id);
      return success(res, category, "تم جلب التصنيف بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request<{}, {}, CreateCategoryInput>, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      return success(res, category, "تم إنشاء التصنيف بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      return success(res, category, "تم تحديث التصنيف بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await categoryService.deactivate(req.params.id);
      return success(res, {}, "تم تعطيل التصنيف بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async addAttribute(req: Request<{ id: string }, {}, CreateAttributeInput>, res: Response, next: NextFunction) {
    try {
      const attribute = await categoryService.addAttribute(req.params.id, req.body);
      return success(res, attribute, "تم إضافة الخاصية بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async updateAttribute(
    req: Request<{ attributeId: string }, {}, UpdateAttributeInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const attribute = await categoryService.updateAttribute(req.params.attributeId, req.body);
      return success(res, attribute, "تم تحديث الخاصية بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async deleteAttribute(req: Request<{ attributeId: string }>, res: Response, next: NextFunction) {
    try {
      await categoryService.deleteAttribute(req.params.attributeId);
      return success(res, {}, "تم حذف الخاصية بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async addAttributeOption(
    req: Request<{ attributeId: string }, {}, CreateAttributeOptionInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const option = await categoryService.addAttributeOption(req.params.attributeId, req.body);
      return success(res, option, "تم إضافة الخيار بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteAttributeOption(req: Request<{ optionId: string }>, res: Response, next: NextFunction) {
    try {
      await categoryService.deleteAttributeOption(req.params.optionId);
      return success(res, {}, "تم حذف الخيار بنجاح");
    } catch (err) {
      next(err);
    }
  },
};