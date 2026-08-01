import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { AdvertisementStatus } from "@prisma/client";

export const favoriteService = {
  async add(userId: string, advertisementId: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: advertisementId } });
    if (!ad || ad.deletedAt) throw new AppError("الإعلان غير موجود", 404);

    const existing = await prisma.favorite.findUnique({
      where: { userId_advertisementId: { userId, advertisementId } },
    });
    if (existing) throw new AppError("الإعلان موجود بالمفضلة مسبقاً", 409);

    return prisma.favorite.create({ data: { userId, advertisementId } });
  },

  async remove(userId: string, advertisementId: string) {
    const existing = await prisma.favorite.findUnique({
      where: { userId_advertisementId: { userId, advertisementId } },
    });
    if (!existing) throw new AppError("الإعلان غير موجود بالمفضلة", 404);

    await prisma.favorite.delete({ where: { id: existing.id } });
  },

  async list(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: {
        advertisement: {
          include: {
            images: { where: { isCover: true }, take: 1 },
            category: { select: { nameAr: true } },
            governorate: { select: { nameAr: true } },
            city: { select: { nameAr: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};