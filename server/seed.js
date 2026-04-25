import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("nutrition1234", 10);

  const nutritionist = await prisma.user.upsert({
    where: { email: "nutrition@test1.com" },
    update: {},
    create: {
      email:      "nutrition@test1.com",
      password:   hashedPassword,
      role:       "NUTRITION",
      firstName:  "Sarah",
      lastName:   "Mitchell",
      needsSetup: false,
    },
  });

  console.log("✅ Nutritionist created:");
  console.log("  Email:    nutrition@test.com");
  console.log("  Password: nutrition123");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());