import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const iraq = await prisma.country.upsert({
    where: { code: "IQ" },
    update: {},
    create: { code: "IQ", nameAr: "العراق", nameEn: "Iraq" },
  });

  const governoratesData = [
    {
      nameAr: "بغداد",
      nameEn: "Baghdad",
      cities: ["الرصافة", "الكرخ", "الكاظمية", "المدائن"],
    },
    {
      nameAr: "البصرة",
      nameEn: "Basra",
      cities: ["البصرة المركز", "الزبير", "أبو الخصيب"],
    },
    {
      nameAr: "أربيل",
      nameEn: "Erbil",
      cities: ["أربيل المركز", "شقلاوة", "سوران"],
    },
  ];

  for (const gov of governoratesData) {
    const governorate = await prisma.governorate.upsert({
      where: {
        // ماكو unique على nameAr لوحدها، فنستخدم findFirst + create يدوي
        id: (await prisma.governorate.findFirst({ where: { nameAr: gov.nameAr } }))?.id ?? "___none___",
      },
      update: {},
      create: {
        nameAr: gov.nameAr,
        nameEn: gov.nameEn,
        countryId: iraq.id,
      },
    });

    for (const cityName of gov.cities) {
      const exists = await prisma.city.findFirst({
        where: { nameAr: cityName, governorateId: governorate.id },
      });
      if (!exists) {
        await prisma.city.create({
          data: { nameAr: cityName, governorateId: governorate.id },
        });
      }
    }
  }

  console.log("✅ تم إدخال بيانات الدولة والمحافظات والمدن بنجاح");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });