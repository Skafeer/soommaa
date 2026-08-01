import { Router } from "express";
import { UserRole } from "@prisma/client";
import { advertisementController } from "./advertisement.controller";
import { validate } from "@/middlewares/validate";
import { validateQuery } from "@/middlewares/validateQuery";
import { authenticate, requireRole } from "@/middlewares/authenticate";
import { uploadImages } from "@/middlewares/upload";
import {
  createAdvertisementSchema,
  updateAdvertisementSchema,
  rejectAdvertisementSchema,
  listAdvertisementsQuerySchema,
} from "./advertisement.validators";

const router = Router();
const adminOnly = [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)];

// عام
router.get("/", validateQuery(listAdvertisementsQuerySchema), advertisementController.list);

// مستخدم مسجل (لاحظ ترتيب /mine قبل /:id لتفادي التعارض)
router.get("/mine", authenticate, advertisementController.listMine);
router.post("/", authenticate, validate(createAdvertisementSchema), advertisementController.create);

router.get("/:id", advertisementController.getPublicById);
router.put("/:id", authenticate, validate(updateAdvertisementSchema), advertisementController.update);
router.post("/:id/submit", authenticate, advertisementController.submitForReview);
router.post("/:id/mark-sold", authenticate, advertisementController.markAsSold);
router.post("/:id/renew", authenticate, advertisementController.renew);

router.post("/:id/images", authenticate, uploadImages.array("images", 10), advertisementController.uploadImages);
router.delete("/:id/images/:imageId", authenticate, advertisementController.deleteImage);

// أدمن
router.get("/admin/pending", ...adminOnly, advertisementController.listPendingReview);
router.post("/admin/:id/approve", ...adminOnly, advertisementController.approve);
router.post("/admin/:id/reject", ...adminOnly, validate(rejectAdvertisementSchema), advertisementController.reject);

export default router;