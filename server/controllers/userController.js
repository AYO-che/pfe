import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";

const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// =====================
// 1️⃣ Get all nutritionists (ADMIN)
// =====================
export const getAllNutritionists = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "NUTRITION", deletedAt: null },
      include: { resume: true },
    });

    res.json(users.map(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 🔥 2️⃣ Get nutritionists by offer type
// =====================
export const getNutritionistsByOfferType = async (req, res) => {
  try {
    const { type } = req.query;

    // Only validate type if it was actually provided
    if (type && !["PLAN", "PACKAGE"].includes(type))
      return res.status(400).json({ message: "Invalid type" });

    const users = await prisma.user.findMany({
      where: {
        role: "NUTRITION",
        deletedAt: null,
        // Only filter by type if one was given
        ...(type && {
          resume: {
            offersTypes: { has: type },
          },
        }),
      },
      include: { resume: true },
    });

    res.json(users.map(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// =====================
// 3️⃣ Get all clients
// =====================
export const getAllClients = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CLIENT", deletedAt: null },
      include: { profile: true },
    });

    res.json(users.map(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 4️⃣ Get user by ID
// =====================
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, resume: true },
    });

    if (!user || user.deletedAt)
      return res.status(404).json({ message: "User not found" });

    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 5️⃣ Create nutritionist
// =====================
export const createNutritionist = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password are required",
      });

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing)
      return res.status(400).json({
        message: "Email already in use",
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "NUTRITION",
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      },
    });

    // 🔥 create resume with offersTypes
    await prisma.resume.create({
      data: {
        userId: user.id,
        offersTypes: [], // يقدر يعدلها من بعد
      },
    });

    res.status(201).json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 6️⃣ Update user
// =====================
export const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.deletedAt)
      return res.status(404).json({ message: "User not found" });

    const { firstName, lastName, image, password } = req.body;

    const data = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(image !== undefined && { image }),
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    res.json(safeUser(updated));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 7️⃣ Delete user (soft delete)
// =====================
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.deletedAt)
      return res.status(404).json({ message: "User not found" });

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminActivity = async (req, res) => {
  try {
    const [recentUsers, recentSubs, recentPosts, recentInquiries] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, firstName: true, lastName: true, role: true, createdAt: true } }),
      prisma.subscription.findMany({ orderBy: { startDate: 'desc' }, take: 5, include: { patient: { select: { firstName: true, lastName: true } }, offer: { select: { name: true } } } }),
      prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, include: { author: { select: { firstName: true, lastName: true } } } }),
      prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, resolved: true, createdAt: true } }),
    ])
    res.json({ recentUsers, recentSubs, recentPosts, recentInquiries })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}