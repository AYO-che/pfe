import prisma from "../prismaClient.js";

// ==============================
// 1️⃣ Create Offer (NUTRITION only)
// ==============================
export const createOffer = async (req, res) => {
  try {
    const nutritionId = req.user.id;

    const {
      name,
      description,
      type,
      price,
      durationDays,
      hasFreeTrial,
      sessionsCount,
      chatDays,
    } = req.body;

    // ==============================
    // Validation
    // ==============================
    if (!name || !type || price === undefined || !durationDays) {
      return res.status(400).json({
        message: "name, type, price and durationDays are required",
      });
    }

    if (!["PLAN", "AI_CALORIES", "PACKAGE"].includes(type)) {
      return res.status(400).json({
        message: "Invalid offer type. Must be PLAN, AI_CALORIES or PACKAGE",
      });
    }

    // ==============================
    // PLAN / PACKAGE need Stripe
    // ==============================
    if (
      (type === "PLAN" || type === "PACKAGE") &&
      Number(price) > 0
    ) {
      const stripeAccount = await prisma.stripe.findUnique({
        where: { userId: nutritionId },
      });

      if (!stripeAccount) {
        return res.status(400).json({
          message:
            "You must connect Stripe before creating a paid PLAN or PACKAGE offer",
        });
      }
    }

    // ==============================
    // PACKAGE validation
    // ==============================
    if (type === "PACKAGE") {
      if (!sessionsCount || Number(sessionsCount) < 1) {
        return res.status(400).json({
          message: "sessionsCount must be at least 1 for PACKAGE offers",
        });
      }
    }

    // ==============================
    // Create Offer
    // ==============================
    const offer = await prisma.offer.create({
      data: {
        nutritionId,
        name,
        description: description ?? null,
        type,
        price: Number(price),
        durationDays: Number(durationDays),
        hasFreeTrial: hasFreeTrial ?? false,

        // PACKAGE only
        sessionsCount:
          type === "PACKAGE" ? Number(sessionsCount) : 0,

        chatDays:
          type === "PACKAGE" ? Number(chatDays ?? 0) : 0,

        isActive: true,
      },
    });

    // ==============================
    // Update Resume ONLY for PLAN/PACKAGE
    // ==============================
    if (type === "PLAN" || type === "PACKAGE") {
      const resume = await prisma.resume.findUnique({
        where: { userId: nutritionId },
      });

      if (!resume) {
        return res.status(404).json({
          message: "Nutritionist resume not found",
        });
      }

      const currentTypes = resume.offersTypes || [];

      if (!currentTypes.includes(type)) {
        await prisma.resume.update({
          where: { userId: nutritionId },
          data: {
            offersTypes: {
              push: type,
            },
          },
        });
      }
    }

    return res.status(201).json({ offer });
  } catch (err) {
    console.error("Create Offer Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
// ==============================
// 2️⃣ Get all active offers
// ==============================
export const getAllOffers = async (req, res) => {
  try {
    const { type } = req.query;

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
      },
      include: {
        plan: {
          include: {
            nutrition: {
              select: { id: true, firstName: true, lastName: true, image: true, resume: true },
            },
          },
        },
        nutrition: {
          select: { id: true, firstName: true, lastName: true, image: true, resume: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 3️⃣ Get all PACKAGE offers
// ==============================
export const getPackageOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { type: "PACKAGE", isActive: true },
      include: {
        nutrition: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            resume: {
              select: {
                bio: true,
                experienceYears: true,
                specializations: true,
                ratingAverage: true,
                education: true,
                workplace: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 4️⃣ Get all PLAN offers
// ==============================
export const getPlanOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: {
        type: "PLAN",
        isActive: true,
        plan: {
          isPrivate: false,  // 👈 exclude private plans
        },
      },
      include: {
        plan: true,
        nutrition: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            resume: {
              select: {
                bio: true,
                experienceYears: true,
                specializations: true,
                ratingAverage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by nutritionist — one entry per specialist with all their offers
    const map = new Map();
    offers.forEach(offer => {
      const sp = offer.nutrition;
      if (!sp) return;
      if (!map.has(sp.id)) {
        map.set(sp.id, { ...sp, offersAsNutrition: [] });
      }
      map.get(sp.id).offersAsNutrition.push(offer);
    });

    res.json({ nutritionists: [...map.values()] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 5️⃣ Get single offer by ID
// ==============================
export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        plan: true,
        nutrition: {
          select: { id: true, firstName: true, lastName: true, image: true, resume: true },
        },
      },
    });

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ offer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 6️⃣ Get my offers (NUTRITION)
// ==============================
export const getMyOffers = async (req, res) => {
  try {
    const nutritionId = req.user.id;

    const offers = await prisma.offer.findMany({
      where:   { nutritionId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 7️⃣ Update Offer
// ==============================
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      durationDays,
      hasFreeTrial,
      isActive,
      sessionsCount,
      chatDays,
    } = req.body;

    const offer = await prisma.offer.findUnique({
      where:   { id },
      include: { plan: true },
    });
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const ownerId = offer.nutritionId ?? offer.plan?.nutritionId;
    if (req.user.role !== "ADMIN" && ownerId !== req.user.id)
      return res.status(403).json({ message: "Access forbidden" });

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        ...(name          !== undefined && { name }),
        ...(description   !== undefined && { description }),
        ...(price         !== undefined && { price: Number(price) }),
        ...(durationDays  !== undefined && { durationDays: Number(durationDays) }),
        ...(hasFreeTrial  !== undefined && { hasFreeTrial }),
        ...(isActive      !== undefined && { isActive }),
        ...(sessionsCount !== undefined && { sessionsCount: Number(sessionsCount) }),
        ...(chatDays      !== undefined && { chatDays: Number(chatDays) }),
      },
    });

    res.json({ offer: updatedOffer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 8️⃣ Delete Offer
// ==============================
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    // permission check
    if (
      req.user.role !== "ADMIN" &&
      offer.nutritionId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Access forbidden",
      });
    }

    // =========================
    // SOFT DELETE
    // =========================
    await prisma.offer.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });

    return res.json({
      message: "Offer deleted (soft delete)",
    });
  } catch (err) {
    console.error("Soft Delete Offer Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
// ==============================
// 9️⃣ Get AI_CALORIES offers (PUBLIC — no auth needed)
// GET /offers/ai-calories
// ==============================
export const getAICaloriesOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: {
        type:     "AI_CALORIES",
        isActive: true,
      },
      orderBy: { price: "asc" },
    });

    if (!offers || offers.length === 0)
      return res.status(404).json({ message: "No AI Calories offers found" });

    res.json({ offers });
  } catch (err) {
    console.error("getAICaloriesOffers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};