import { z } from "zod";
import { ProductCondition, Currency } from "@prisma/client";

export const attributeValueSchema = z.object({
  categoryAttributeId: z.string().cuid(),
  valueText: z.string().optional(),
  valueNumber: z.number().optional(),
  valueBoolean: z.boolean().optional(),
  optionId: z.string().cuid().optional(),
});

export const createAdvertisementSchema = z.object({
  categoryId: z.string().cuid(),
  governorateId: z.string().cuid(),
  cityId: z.string().cuid(),
  title: z.string().min(5).max(150),
  description: z.string().min(10).max(3000),
  price: z.number().positive(),
  currency: z.nativeEnum(Currency).optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  attributeValues: z.array(attributeValueSchema).optional(),
});

export const updateAdvertisementSchema = createAdvertisementSchema.partial();

export const rejectAdvertisementSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const listAdvertisementsQuerySchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  governorateId: z.string().cuid().optional(),
  cityId: z.string().cuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type CreateAdvertisementInput = z.infer<typeof createAdvertisementSchema>;
export type UpdateAdvertisementInput = z.infer<typeof updateAdvertisementSchema>;
export type RejectAdvertisementInput = z.infer<typeof rejectAdvertisementSchema>;
export type ListAdvertisementsQuery = z.infer<typeof listAdvertisementsQuerySchema>;