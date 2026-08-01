import { Router } from "express";
import { chatController } from "./chat.controller";
import { validate } from "@/middlewares/validate";
import { authenticate } from "@/middlewares/authenticate";
import { sendMessageSchema } from "./chat.validators";

const router = Router();

router.get("/", authenticate, chatController.listMyChats);
router.get("/:chatId/messages", authenticate, chatController.getMessages);
router.post("/:chatId/messages", authenticate, validate(sendMessageSchema), chatController.reply);
router.post(
  "/advertisements/:advertisementId/start",
  authenticate,
  validate(sendMessageSchema),
  chatController.startOrSendMessage
);

export default router;