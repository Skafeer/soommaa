import { z } from "zod";

export const createReportSchema = z
  .object({
    targetType: z.enum(["ADVERTISEMENT", "USER"]),
    advertisementId: z.string().cuid().optional(),
    reportedUserId: z.string().cuid().optional(),
    reason: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      (data.targetType === "ADVERTISEMENT" && !!data.advertisementId && !data.reportedUserId) ||
      (data.targetType === "USER" && !!data.reportedUserId && !data.advertisementId),
    { message: "يجب تحديد الإعلان فقط عند الإبلاغ عن إعلان، أو المستخدم فقط عند الإبلاغ عن مستخدم" }
  );

export const resolveReportSchema = z.object({
  status: z.enum(["ACTION_TAKEN", "DISMISSED"]),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;