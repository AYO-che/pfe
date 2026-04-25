const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fix() {
  await prisma.resume.updateMany({
    where: {
      offersTypes: {
        has: "AI_CALORIES",
      },
    },
    data: {
      offersTypes: {
        set: ["PLAN", "CONSULTATION"],
      },
    },
  });

  console.log("✅ fixed resumes");
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());