import { Request, Response, NextFunction } from "express";
import { chatService } from "./chat.service";
import { success } from "@/utils/ApiResponse";
import { SendMessageInput } from "./chat.validators";

export const chatController = {
  async startOrSendMessage(
    req: Request<{ advertisementId: string }, {}, SendMessageInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await chatService.startOrSendMessage(
        req.user!.userId,
        req.params.advertisementId,
        req.body.content
      );
      return success(res, result, "تم إرسال الرسالة بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async reply(req: Request<{ chatId: string }, {}, SendMessageInput>, res: Response, next: NextFunction) {
    try {
      const message = await chatService.reply(req.user!.userId, req.params.chatId, req.body.content);
      return success(res, message, "تم إرسال الرسالة بنجاح", 201);
    } catch (err) {
      next(err);
    }
  },

  async listMyChats(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.listMyChats(req.user!.userId);
      return success(res, chats, "تم جلب المحادثات بنجاح");
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req: Request<{ chatId: string }>, res: Response, next: NextFunction) {
    try {
      const messages = await chatService.getMessages(req.user!.userId, req.params.chatId);
      return success(res, messages, "تم جلب الرسائل بنجاح");
    } catch (err) {
      next(err);
    }
  },
};