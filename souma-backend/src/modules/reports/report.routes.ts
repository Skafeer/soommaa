import { Router } from "express";
import { UserRole } from "@prisma/client";
import { reportController } from "./report.controller";
import { validate } from "@/middlewares/validate";
import { authenticate, requireRole } from "@/middlewares/authenticate";
import { createReportSchema, resolveReportSchema } from "./report.validators";

const router = Router();
const adminOnly = [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)];

router.post("/", authenticate, validate(createReportSchema), reportController.create);
router.get("/admin/pending", ...adminOnly, reportController.listPending);
router.post("/admin/:id/resolve", ...adminOnly, validate(resolveReportSchema), reportController.resolve);

export default router;