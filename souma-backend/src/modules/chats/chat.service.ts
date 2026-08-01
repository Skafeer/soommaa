import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { AdvertisementStatus } from "@prisma/client";

export const chatService = {
  async startOrSendMessage(buyerId: string, advertisementId: string, content: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: advertisementId } });
    if (!ad || ad.deletedAt) throw new AppError("الإعلان غير موجود", 404);

    if (ad.userId === buyerId) {
      throw new AppError("لا يمكنك بدء محادثة على إعلانك الخاص", 422);
    }

    const allowedAdStatuses: AdvertisementStatus[] = [AdvertisementStatus.PUBLISHED, AdvertisementStatus.SOLD];
    if (!allowedAdStatuses.includes(ad.status)) {
      throw new AppError("لا يمكن بدء محادثة على إعلان غير منشور", 422);
    }

    let chat = await prisma.chat.findUnique({
      where: {
        advertisementId_buyerId_sellerId: {
          advertisementId,
          buyerId,
          sellerId: ad.userId,
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { advertisementId, buyerId, sellerId: ad.userId },
      });
    }

    const message = await prisma.message.create({
      data: { chatId: chat.id, senderId: buyerId, content },
    });

    await prisma.chat.update({
      where: { id: chat.id },
      data: { lastMessageAt: new Date() },
    });

    return { chat, message };
  },

  async reply(userId: string, chatId: string, content: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new AppError("المحادثة غير موجودة", 404);

    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new AppError("لا تملك صلاحية الوصول لهذه المحادثة", 403);
    }

    const message = await prisma.message.create({
      data: { chatId, senderId: userId, content },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  },

  async listMyChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        advertisement: {
          select: {
            id: true,
            title: true,
            price: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
        buyer: { select: { id: true, fullName: true } },
        seller: { select: { id: true, fullName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return chats;
  },

  async getMessages(userId: string, chatId: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new AppError("المحادثة غير موجودة", 404);

    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new AppError("لا تملك صلاحية الوصول لهذه المحادثة", 403);
    }

    const isBuyer = chat.buyerId === userId;

    await prisma.chat.update({
      where: { id: chatId },
      data: isBuyer ? { buyerLastReadAt: new Date() } : { sellerLastReadAt: new Date() },
    });

    await prisma.message.updateMany({
      where: { chatId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
  },
};