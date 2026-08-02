import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { AdvertisementStatus, CategoryAttributeType, Prisma } from "@prisma/client";
import { sendTelegramNotification } from "@/lib/telegram";
import {
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
  ListAdvertisementsQuery,
} from "./advertisement.validators";

const AD_EXPIRY_DAYS = 30;

interface AttributeValueToCreate {
  categoryAttributeId: string;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  optionId?: string;
}

async function validateAndBuildAttributeValues(
  categoryId: string,
  attributeValues: CreateAdvertisementInput["attributeValues"]
): Promise<AttributeValueToCreate[]> {
  const categoryAttributes = await prisma.categoryAttribute.findMany({
    where: { categoryId },
    include: { options: true },
  });

  const providedMap = new Map((attributeValues ?? []).map((av) => [av.categoryAttributeId, av]));
  const result: AttributeValueToCreate[] = [];

  for (const attr of categoryAttributes) {
    const provided = providedMap.get(attr.id);

    if (attr.isRequired && !provided) {
      throw new AppError(`الخاصية "${attr.nameAr}" مطلوبة`, 422);
    }
    if (!provided) continue;

    if (attr.type === CategoryAttributeType.TEXT && !provided.valueText) {
      throw new AppError(`الخاصية "${attr.nameAr}" يجب أن تكون نصية`, 422);
    }
    if (attr.type === CategoryAttributeType.NUMBER && provided.valueNumber === undefined) {
      throw new AppError(`الخاصية "${attr.nameAr}" يجب أن تكون رقمية`, 422);
    }
    if (attr.type === CategoryAttributeType.BOOLEAN && provided.valueBoolean === undefined) {
      throw new AppError(`الخاصية "${attr.nameAr}" يجب أن تكون صح/خطأ`, 422);
    }
    if (attr.type === CategoryAttributeType.SELECT) {
      if (!provided.optionId) throw new AppError(`الخاصية "${attr.nameAr}" تحتاج اختيار قيمة`, 422);
      const validOption = attr.options.some((o) => o.id === provided.optionId);
      if (!validOption) throw new AppError(`القيمة المختارة للخاصية "${attr.nameAr}" غير صحيحة`, 422);
    }
    if (attr.type === CategoryAttributeType.MULTI_SELECT) {
      throw new AppError(`نوع الخاصية "${attr.nameAr}" غير مدعوم حالياً`, 422);
    }

    result.push({
      categoryAttributeId: attr.id,
      valueText: provided.valueText,
      valueNumber: provided.valueNumber,
      valueBoolean: provided.valueBoolean,
      optionId: provided.optionId,
    });
  }

  return result;
}

export const advertisementService = {
  async create(userId: string, input: CreateAdvertisementInput) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category || !category.isActive) throw new AppError("التصنيف غير موجود أو غير مفعّل", 404);

    const governorate = await prisma.governorate.findUnique({ where: { id: input.governorateId } });
    if (!governorate) throw new AppError("المحافظة غير موجودة", 404);

    const city = await prisma.city.findUnique({ where: { id: input.cityId } });
    if (!city || city.governorateId !== input.governorateId) {
      throw new AppError("المدينة غير موجودة أو لا تتبع المحافظة المحددة", 422);
    }

    const attributeValues = await validateAndBuildAttributeValues(input.categoryId, input.attributeValues);

    return prisma.advertisement.create({
      data: {
        userId,
        categoryId: input.categoryId,
        governorateId: input.governorateId,
        cityId: input.cityId,
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency,
        condition: input.condition,
        status: AdvertisementStatus.DRAFT,
        attributeValues: { createMany: { data: attributeValues } },
      },
      include: { images: true, attributeValues: true },
    });
  },

  async getOwnedOrThrow(userId: string, adId: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad || ad.deletedAt) throw new AppError("الإعلان غير موجود", 404);
    if (ad.userId !== userId) throw new AppError("لا تملك صلاحية التعديل على هذا الإعلان", 403);
    return ad;
  },

  async submitForReview(userId: string, adId: string) {
    const ad = await this.getOwnedOrThrow(userId, adId);

    if (ad.status !== AdvertisementStatus.DRAFT) {
      throw new AppError("لا يمكن إرسال هذا الإعلان للمراجعة من حالته الحالية", 422);
    }

    const imagesCount = await prisma.advertisementImage.count({ where: { advertisementId: adId } });
    if (imagesCount === 0) {
      throw new AppError("يجب إضافة صورة واحدة على الأقل قبل إرسال الإعلان للمراجعة", 422);
    }

    const result = await this.transitionStatus(adId, AdvertisementStatus.PENDING_REVIEW, {
      changedByUserId: userId,
    });

    sendTelegramNotification(
      `📢 <b>إعلان جديد بانتظار المراجعة</b>\n\n` +
        `العنوان: ${ad.title}\n` +
        `السعر: ${Number(ad.price).toLocaleString()} ${ad.currency}\n` +
        `رابط اللوحة: راجعه من لوحة التحكم`
    );

    return result;
  },

  async update(userId: string, adId: string, input: UpdateAdvertisementInput) {
    const ad = await this.getOwnedOrThrow(userId, adId);

    const allowedStatuses: AdvertisementStatus[] = [AdvertisementStatus.DRAFT, AdvertisementStatus.PUBLISHED];
    if (!allowedStatuses.includes(ad.status)) {
      throw new AppError("لا يمكن تعديل الإعلان من حالته الحالية", 422);
    }

    let attributeValuesData: AttributeValueToCreate[] | undefined;
    if (input.attributeValues) {
      const categoryId = input.categoryId ?? ad.categoryId;
      attributeValuesData = await validateAndBuildAttributeValues(categoryId, input.attributeValues);
    }

    const wasPublished = ad.status === AdvertisementStatus.PUBLISHED;

    return prisma.$transaction(async (tx) => {
      if (attributeValuesData) {
        await tx.advertisementAttributeValue.deleteMany({ where: { advertisementId: adId } });
      }

      const result = await tx.advertisement.update({
        where: { id: adId },
        data: {
          ...(input.categoryId && { categoryId: input.categoryId }),
          ...(input.governorateId && { governorateId: input.governorateId }),
          ...(input.cityId && { cityId: input.cityId }),
          ...(input.title && { title: input.title }),
          ...(input.description && { description: input.description }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.currency && { currency: input.currency }),
          ...(input.condition && { condition: input.condition }),
          ...(wasPublished && { status: AdvertisementStatus.PENDING_REVIEW }),
          ...(attributeValuesData && { attributeValues: { createMany: { data: attributeValuesData } } }),
        },
        include: { images: true, attributeValues: true },
      });

      if (wasPublished) {
        await tx.advertisementStatusHistory.create({
          data: {
            advertisementId: adId,
            fromStatus: AdvertisementStatus.PUBLISHED,
            toStatus: AdvertisementStatus.PENDING_REVIEW,
            reason: "تعديل المستخدم للإعلان بعد النشر",
            changedByUserId: userId,
          },
        });
      }

      return result;
    });
  },

  async transitionStatus(
    adId: string,
    toStatus: AdvertisementStatus,
    meta: { changedByAdminId?: string; changedByUserId?: string; reason?: string }
  ) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad) throw new AppError("الإعلان غير موجود", 404);

    const dataUpdate: Prisma.AdvertisementUpdateInput = { status: toStatus };

    if (toStatus === AdvertisementStatus.PUBLISHED) {
      dataUpdate.publishedAt = new Date();
      dataUpdate.expiresAt = new Date(Date.now() + AD_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      dataUpdate.rejectionReason = null;
    }
    if (toStatus === AdvertisementStatus.REJECTED) {
      dataUpdate.rejectionReason = meta.reason;
    }
    if (toStatus === AdvertisementStatus.SOLD) {
      dataUpdate.soldAt = new Date();
    }

    return prisma.$transaction(async (tx) => {
      const result = await tx.advertisement.update({ where: { id: adId }, data: dataUpdate });
      await tx.advertisementStatusHistory.create({
        data: {
          advertisementId: adId,
          fromStatus: ad.status,
          toStatus,
          reason: meta.reason,
          changedByAdminId: meta.changedByAdminId,
          changedByUserId: meta.changedByUserId,
        },
      });
      return result;
    });
  },

  async markAsSold(userId: string, adId: string) {
    const ad = await this.getOwnedOrThrow(userId, adId);
    if (ad.status !== AdvertisementStatus.PUBLISHED) {
      throw new AppError("لا يمكن تحديد الإعلان كمباع إلا من حالة منشور", 422);
    }
    return this.transitionStatus(adId, AdvertisementStatus.SOLD, { changedByUserId: userId });
  },

  async renew(userId: string, adId: string) {
    const ad = await this.getOwnedOrThrow(userId, adId);
    if (ad.status !== AdvertisementStatus.EXPIRED) {
      throw new AppError("لا يمكن تجديد إعلان إلا إذا كان منتهياً", 422);
    }

    return prisma.$transaction(async (tx) => {
      const result = await tx.advertisement.update({
        where: { id: adId },
        data: { status: AdvertisementStatus.PENDING_REVIEW, renewalCount: { increment: 1 } },
      });
      await tx.advertisementStatusHistory.create({
        data: {
          advertisementId: adId,
          fromStatus: AdvertisementStatus.EXPIRED,
          toStatus: AdvertisementStatus.PENDING_REVIEW,
          reason: "تجديد الإعلان من قبل المستخدم",
          changedByUserId: userId,
        },
      });
      return result;
    });
  },

  async getPublicById(adId: string) {
    const ad = await prisma.advertisement.findFirst({
      where: { id: adId, status: AdvertisementStatus.PUBLISHED, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        attributeValues: { include: { categoryAttribute: true, option: true } },
        category: true,
        governorate: true,
        city: true,
        user: { select: { id: true, fullName: true, phoneVerifiedAt: true, phoneNumber: true } },
      },
    });

    if (!ad) throw new AppError("الإعلان غير موجود أو غير منشور", 404);

    await prisma.advertisement.update({ where: { id: adId }, data: { viewsCount: { increment: 1 } } });

    return ad;
  },

  async list(query: ListAdvertisementsQuery) {
    const where: Prisma.AdvertisementWhereInput = {
      status: AdvertisementStatus.PUBLISHED,
      deletedAt: null,
    };

    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: "insensitive" } },
        { description: { contains: query.keyword, mode: "insensitive" } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.governorateId) where.governorateId = query.governorateId;
    if (query.cityId) where.cityId = query.cityId;
    if (query.condition) where.condition = query.condition;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      };
    }

    const [items, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: {
          images: { where: { isCover: true }, take: 1 },
          category: { select: { nameAr: true, slug: true } },
          governorate: { select: { nameAr: true } },
          city: { select: { nameAr: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.advertisement.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  },

  async listMine(userId: string) {
    return prisma.advertisement.findMany({
      where: { userId, deletedAt: null },
      include: { images: { where: { isCover: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  },

  // ==== أدمن ====

  async listPendingReview() {
    return prisma.advertisement.findMany({
      where: { status: AdvertisementStatus.PENDING_REVIEW },
      include: {
        images: true,
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        category: { select: { nameAr: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async approve(adminId: string, adId: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad) throw new AppError("الإعلان غير موجود", 404);
    if (ad.status !== AdvertisementStatus.PENDING_REVIEW) {
      throw new AppError("لا يمكن قبول إعلان إلا من حالة قيد المراجعة", 422);
    }
    return this.transitionStatus(adId, AdvertisementStatus.PUBLISHED, { changedByAdminId: adminId });
  },

  async reject(adminId: string, adId: string, reason: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad) throw new AppError("الإعلان غير موجود", 404);
    if (ad.status !== AdvertisementStatus.PENDING_REVIEW) {
      throw new AppError("لا يمكن رفض إعلان إلا من حالة قيد المراجعة", 422);
    }
    return this.transitionStatus(adId, AdvertisementStatus.REJECTED, { changedByAdminId: adminId, reason });
  },
};