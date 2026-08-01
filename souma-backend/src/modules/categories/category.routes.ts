import { Router } from "express";
import { UserRole } from "@prisma/client";
import { categoryController } from "./category.controller";
import { validate } from "@/middlewares/validate";
import { authenticate, requireRole } from "@/middlewares/authenticate";
import {
  createCategorySchema,
  updateCategorySchema,
  createAttributeSchema,
  updateAttributeSchema,
  createAttributeOptionSchema,
} from "./category.validators";

const router = Router();

const adminOnly = [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)];

// عام - متاح للجميع
router.get("/", categoryController.listTree);
router.get("/:id", categoryController.getById);

// أدمن - التصنيفات
router.post("/", ...adminOnly, validate(createCategorySchema), categoryController.create);
router.put("/:id", ...adminOnly, validate(updateCategorySchema), categoryController.update);
router.delete("/:id", ...adminOnly, categoryController.deactivate);

// أدمن - الخصائص الديناميكية
router.post("/:id/attributes", ...adminOnly, validate(createAttributeSchema), categoryController.addAttribute);
router.put(
  "/attributes/:attributeId",
  ...adminOnly,
  validate(updateAttributeSchema),
  categoryController.updateAttribute
);
router.delete("/attributes/:attributeId", ...adminOnly, categoryController.deleteAttribute);

// أدمن - خيارات القوائم المنسدلة
router.post(
  "/attributes/:attributeId/options",
  ...adminOnly,
  validate(createAttributeOptionSchema),
  categoryController.addAttributeOption
);
router.delete("/attribute-options/:optionId", ...adminOnly, categoryController.deleteAttributeOption);

export default router;