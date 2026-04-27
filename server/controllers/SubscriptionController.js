// controllers/subscriptionController.js
import prisma from "../prismaClient.js";

const userSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    image: true,
  },
};

// ==============================
// 1️⃣ Create a subscription (CLIENT)
// ==============================
export const createSubscription = async (req, res) => {
  try {
    const { offerId, nutritionId } = req.body;
    const userId = req.user.id;

    if (!offerId) {
      return res.status(400).json({ message: "offerId is required" });
    }

    // Get offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
if (!offer.isActive) {
  return res.status(400).json({ message: "Offer is no longer active" });
}

    // Prevent duplicate active/pending subscription
    const existing = await prisma.subscription.findFirst({
      where: {
        patientId: userId,
        offerId,
        status: { in: ["ACTIVE"] },
      },
    });

if (existing) {
  return res.status(200).json({
    subscription: existing,
    isFree: false,
    message: "Subscription already exists, continue payment",
  });
}

    let linkedNutritionId = null;
    let isFree = false;
    let durationDays = offer.durationDays;

    // ==============================
    // CONSULTATION
    // ==============================
    if (offer.type === "CONSULTATION") {
      if (!nutritionId) {
        return res.status(400).json({
          message: "nutritionId is required for consultation offers",
        });
      }
      linkedNutritionId = nutritionId;
    }

    // ==============================
    // PLAN
    // ==============================
    if (offer.type === "PLAN") {
      const plan = await prisma.plan.findUnique({ where: { offerId } });

      if (!plan) {
        return res.status(404).json({ message: "Plan not found for this offer" });
      }

      linkedNutritionId = plan.nutritionId ?? null;

      // Free trial ONLY if price is 0 or user never used free trial
      if (offer.price === 0 || offer.price === "0") {
        isFree = true;
      } else {
        const client = await prisma.user.findUnique({ where: { id: userId } });
        if (!client.usedFreePlanTrial) {
          // First plan ever is free — but ONLY if this is actually the free-tier plan
          // Remove this block if you don't want any plan to be free
          // isFree = true;
          // await prisma.user.update({ where:{id:userId}, data:{usedFreePlanTrial:true} });
        }
      }
    }
    if (offer.type === "PACKAGE") {
  if (!nutritionId) {
    return res.status(400).json({
      message: "nutritionId is required for package offers",
    });
  }
  linkedNutritionId = nutritionId;
  // PACKAGE is never free — always goes to payment
  isFree = false;
}

    // ==============================
    // AI_CALORIES
    // FIX: Only free if offer.price === 0 (the actual free offer).
    // Paid AI plans (Starter, Pro, Elite) must ALWAYS go through payment.
    // The old code made ALL first-time AI subs free — wrong.
    // ==============================
    if (offer.type === "AI_CALORIES") {
      if (Number(offer.price) === 0) {
        // This is the actual free trial offer — activate immediately
        isFree = true;
        durationDays = offer.durationDays || 10;
      }
      // If price > 0: isFree stays false → subscription stays PENDING → goes to payment
    }

    // ==============================
    // Dates
    // ==============================
    const startDate = new Date();
    const endDate   = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // ==============================
    // Create subscription
    // status = ACTIVE only if truly free, otherwise PENDING until paid
    // ==============================
 const subscription = await prisma.subscription.create({
  data: {
    patientId:   userId,
    nutritionId: linkedNutritionId,
    offerId,
    startDate,
    endDate,
    status: isFree ? "ACTIVE" : "PENDING",
  },
});

if (isFree && offer.type === "PLAN") {
  const plan = await prisma.plan.findUnique({ where: { offerId } });
  if (plan?.pdfUrl) {
    await prisma.notification.create({
      data: {
        userId:  userId,
        title:   "Your plan is ready! 🎉",
        message: `Your plan "${plan.title}" has been activated. Download your PDF below.`,
        url:     plan.pdfUrl,
        isRead:  false,
      },
    });
  }
}

    return res.status(201).json({
      subscription,
      isFree,
      message: isFree
        ? "Free subscription activated"
        : "Subscription created, proceed to payment",
    });
  } catch (err) {
    console.error("Create Subscription Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 2️⃣ Get all my subscriptions (CLIENT)
// ==============================
export const getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { patientId: userId },
      include: { offer: true, nutrition: userSelect, payments: true },
      orderBy: { startDate: "desc" },
    });

    res.json({ subscriptions });
  } catch (err) {
    console.error("Get My Subs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 3️⃣ Get single subscription
// ==============================
export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        offer:    true,
        patient:  userSelect,
        nutrition: userSelect,
        payments: true,
        sessions: true,
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (req.user.role !== "ADMIN" && req.user.id !== subscription.patientId) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    res.json({ subscription });
  } catch (err) {
    console.error("Get Sub By Id Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 4️⃣ Get nutrition subscriptions
// ==============================
export const getNutritionSubscriptions = async (req, res) => {
  try {
    const nutritionId = req.user.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { nutritionId },
      include: { offer: true, patient: userSelect, payments: true, sessions: true },
      orderBy: { startDate: "desc" },
    });

    res.json({ subscriptions });
  } catch (err) {
    console.error("Get Nutrition Subs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 5️⃣ Cancel subscription
// ==============================
export const cancelSubscription = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user.id;

    const subscription = await prisma.subscription.findUnique({ where: { id } });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (req.user.role !== "ADMIN" && subscription.patientId !== userId) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    if (subscription.status === "CANCELLED") {
      return res.status(400).json({ message: "Subscription is already cancelled" });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data:  { status: "CANCELLED" },
    });

    res.json({ message: "Subscription cancelled", subscription: updated });
  } catch (err) {
    console.error("Cancel Sub Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};