import { Router } from "express";
import { locationController } from "./location.controller";

const router = Router();

router.get("/governorates", locationController.listGovernorates);

export default router;