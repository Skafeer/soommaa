import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateAttributeOptionInput,
} from "./category.validators";

export const categoryService = {
  async listTree() {
    return prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        attributes: {
          orderBy: { sortOrder: "asc" },
          include: { options: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    if (!category) throw new AppError("التصنيف غير موجود", 404);
    return category;
  },

  async create(input: CreateCategoryInput) {
    const existingSlug = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (existingSlug) throw new AppError("هذا الرابط (slug) مستخدم مسبقاً", 409);

    if (input.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) throw new AppError("التصنيف الرئيسي غير موجود", 404);
    }

    return prisma.category.create({ data: input });
  },

  async update(id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError("التصنيف غير موجود", 404);

    if (input.slug && input.slug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({ where: { slug: input.slug } });
      if (existingSlug) throw new AppError("هذا الرابط (slug) مستخدم مسبقاً", 409);
    }

    if (input.parentId) {
      if (input.parentId === id) throw new AppError("لا يمكن أن يكون التصنيف أباً لنفسه", 422);
      const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) throw new AppError("التصنيف الرئيسي غير موجود", 404);
    }

    return prisma.category.update({ where: { id }, data: input });
  },

  // Soft Delete فقط — حماية للإعلانات المرتبطة بالتصنيف
  async deactivate(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError("التصنيف غير موجود", 404);
    return prisma.category.update({ where: { id }, data: { isActive: false } });
  },

  async addAttribute(categoryId: string, input: CreateAttributeInput) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError("التصنيف غير موجود", 404);

    const existingKey = await prisma.categoryAttribute.findUnique({
      where: { categoryId_key: { categoryId, key: input.key } },
    });
    if (existingKey) throw new AppError("هذا المعرف مستخدم مسبقاً بنفس التصنيف", 409);

    return prisma.categoryAttribute.create({ data: { ...input, categoryId } });
  },

  async updateAttribute(attributeId: string, input: UpdateAttributeInput) {
    const attribute = await prisma.categoryAttribute.findUnique({ where: { id: attributeId } });
    if (!attribute) throw new AppError("الخاصية غير موجودة", 404);
    return prisma.categoryAttribute.update({ where: { id: attributeId }, data: input });
  },

  async deleteAttribute(attributeId: string) {
    const attribute = await prisma.categoryAttribute.findUnique({ where: { id: attributeId } });
    if (!attribute) throw new AppError("الخاصية غير موجودة", 404);
    await prisma.categoryAttribute.delete({ where: { id: attributeId } });
  },

  async addAttributeOption(attributeId: string, input: CreateAttributeOptionInput) {
    const attribute = await prisma.categoryAttribute.findUnique({ where: { id: attributeId } });
    if (!attribute) throw new AppError("الخاصية غير موجودة", 404);

    if (attribute.type !== "SELECT" && attribute.type !== "MULTI_SELECT") {
      throw new AppError("لا يمكن إضافة خيارات إلا لخاصية من نوع قائمة اختيار", 422);
    }

    return prisma.categoryAttributeOption.create({ data: { ...input, categoryAttributeId: attributeId } });
  },

  async deleteAttributeOption(optionId: string) {
    const option = await prisma.categoryAttributeOption.findUnique({ where: { id: optionId } });
    if (!option) throw new AppError("الخيار غير موجود", 404);
    await prisma.categoryAttributeOption.delete({ where: { id: optionId } });
  },
};