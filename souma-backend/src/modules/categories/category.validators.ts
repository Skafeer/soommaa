import { z } from "zod";
import { CategoryAttributeType } from "@prisma/client";

export const createCategorySchema = z.object({
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  parentId: z.string().cuid().optional(),
  iconUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createAttributeSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/, "المعرف البرمجي يجب أن يحتوي أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط"),
  nameAr: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100).optional(),
  type: z.nativeEnum(CategoryAttributeType),
  isRequired: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateAttributeSchema = createAttributeSchema.partial();

export const createAttributeOptionSchema = z.object({
  valueAr: z.string().min(1).max(100),
  valueEn: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type CreateAttributeOptionInput = z.infer<typeof createAttributeOptionSchema>;