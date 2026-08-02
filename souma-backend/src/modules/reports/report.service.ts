import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { ReportStatus } from "@prisma/client";
import { CreateReportInput } from "./report.validators";

export const reportService = {
  async create(reporterId: string, input: CreateReportInput) {
    if (input.targetType === "ADVERTISEMENT") {
      const ad = await prisma.advertisement.findUnique({ where: { id: input.advertisementId! } });
      if (!ad || ad.deletedAt) throw new AppError("الإعلان غير موجود", 404);
      if (ad.userId === reporterId) throw new AppError("لا يمكنك الإبلاغ عن إعلانك الخاص", 422);
    }

    if (input.targetType === "USER") {
      const user = await prisma.user.findUnique({ where: { id: input.reportedUserId! } });
      if (!user) throw new AppError("المستخدم غير موجود", 404);
      if (user.id === reporterId) throw new AppError("لا يمكنك الإبلاغ عن نفسك", 422);
    }

    return prisma.report.create({
      data: {
        reporterId,
        targetType: input.targetType,
        advertisementId: input.advertisementId,
        reportedUserId: input.reportedUserId,
        reason: input.reason,
        description: input.description,
      },
    });
  },

  async listPending() {
    return prisma.report.findMany({
      where: { status: ReportStatus.PENDING },
      include: {
        reporter: { select: { id: true, fullName: true, phoneNumber: true } },
        advertisement: { select: { id: true, title: true } },
        reportedUser: { select: { id: true, fullName: true, phoneNumber: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async resolve(adminId: string, reportId: string, status: "ACTION_TAKEN" | "DISMISSED") {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new AppError("البلاغ غير موجود", 404);
    if (report.status !== ReportStatus.PENDING) {
      throw new AppError("تمت مراجعة هذا البلاغ مسبقاً", 422);
    }

    return prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
      },
    });
  },
};