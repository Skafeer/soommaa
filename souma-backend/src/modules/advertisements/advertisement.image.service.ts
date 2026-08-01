import { prisma } from "@/lib/prisma";
import { AppError } from "@/middlewares/errorHandler";
import { uploadImageBuffer, deleteImageFromCloudinary } from "@/lib/cloudinary";

const MAX_IMAGES_PER_AD = 10;

export const advertisementImageService = {
  async addImages(userId: string, adId: string, files: Express.Multer.File[]) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad || ad.deletedAt) throw new AppError("الإعلان غير موجود", 404);
    if (ad.userId !== userId) throw new AppError("لا تملك صلاحية التعديل على هذا الإعلان", 403);

    const existingCount = await prisma.advertisementImage.count({ where: { advertisementId: adId } });
    if (existingCount + files.length > MAX_IMAGES_PER_AD) {
      throw new AppError(`الحد الأقصى لعدد الصور هو ${MAX_IMAGES_PER_AD} صور لكل إعلان`, 422);
    }

    const uploaded = await Promise.all(
      files.map((file) => uploadImageBuffer(file.buffer, `souma/advertisements/${adId}`))
    );

    const isFirstBatch = existingCount === 0;

    return prisma.$transaction(
      uploaded.map((img, index) =>
        prisma.advertisementImage.create({
          data: {
            advertisementId: adId,
            url: img.url,
            cloudinaryPublicId: img.publicId,
            isCover: isFirstBatch && index === 0,
            sortOrder: existingCount + index,
          },
        })
      )
    );
  },

  async deleteImage(userId: string, adId: string, imageId: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad || ad.deletedAt) throw new AppError("الإعلان غير موجود", 404);
    if (ad.userId !== userId) throw new AppError("لا تملك صلاحية التعديل على هذا الإعلان", 403);

    const image = await prisma.advertisementImage.findUnique({ where: { id: imageId } });
    if (!image || image.advertisementId !== adId) throw new AppError("الصورة غير موجودة", 404);

    await deleteImageFromCloudinary(image.cloudinaryPublicId);
    await prisma.advertisementImage.delete({ where: { id: imageId } });
  },
};