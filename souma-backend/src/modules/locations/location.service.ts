import { prisma } from "@/lib/prisma";

export const locationService = {
  async listGovernorates() {
    return prisma.governorate.findMany({
      where: { isActive: true },
      include: {
        cities: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
};