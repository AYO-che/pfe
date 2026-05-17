// createAdmin.js — run this ONCE from your server folder
// Usage: node createAdmin.js

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email    = "admin@chrysalis.com";
  const password = "Admin@2026";

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Admin already exists:", email);
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password:  hash,
      role:      "ADMIN",
      firstName: "Admin",
      lastName:  "Chrysalis",
      needsSetup: false,
    },
  });

  console.log("✅ Admin account created!");
  console.log("   Email:   ", email);
  console.log("   Password:", password);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());