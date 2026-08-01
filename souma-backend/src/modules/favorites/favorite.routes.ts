import { Router } from "express";
import { favoriteController } from "./favorite.controller";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/", authenticate, favoriteController.list);
router.post("/:advertisementId", authenticate, favoriteController.add);
router.delete("/:advertisementId", authenticate, favoriteController.remove);

export default router;