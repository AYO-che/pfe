import prisma from "../prismaClient.js";

export const createNutritionistReview = async (req, res) => {
  const clientId       = req.user.id;
  const nutritionId    = req.params.nutritionistId; // from URL param
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5." });

  try {
    // 1. Verify patient has an active PACKAGE subscription with this nutritionist
    const subscription = await prisma.subscription.findFirst({
      where: {
        patientId:   clientId,
        nutritionId: nutritionId,
        offer:       { type: "PACKAGE" },
      },
    });

    if (!subscription)
      return res.status(403).json({
        message: "You can only review nutritionists from your package subscriptions.",
      });

    // 2. Find a completed session to attach the review to (required by schema)
    const completedSession = await prisma.session.findFirst({
      where: {
        patientId:      clientId,
        nutritionId:    nutritionId,
        subscriptionId: subscription.id,
        status:         "COMPLETED",
      },
    });

    if (!completedSession)
      return res.status(403).json({
        message: "You need at least one completed session to leave a review.",
      });

    // 3. Prevent duplicate reviews per session
    const existing = await prisma.review.findFirst({
      where: {
        patientId:   clientId,
        nutritionId: nutritionId,
      },
    });

    if (existing)
      return res.status(409).json({ message: "You have already reviewed this nutritionist." });

    // 4. Create review
    const review = await prisma.review.create({
      data: {
        patientId:   clientId,
        nutritionId: nutritionId,
        sessionId:   completedSession.id,
        rating:      parseInt(rating),
        comment:     comment?.trim() || null,
      },
    });

    // 5. Recalculate average rating on Resume
    const agg = await prisma.review.aggregate({
      where: { nutritionId },
      _avg:  { rating: true },
    });

    await prisma.resume.update({
      where: { userId: nutritionId },
      data:  { ratingAverage: agg._avg.rating ?? 0 },
    });

    return res.status(201).json({ message: "Review submitted successfully.", review });
  } catch (err) {
    console.error("createNutritionistReview error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const createReview = async (req, res) => {
  const clientId  = req.user.id;
  const sessionId = req.params.sessionId;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5." });

  try {
    const session = await prisma.session.findFirst({
      where: {
        id:        sessionId,
        patientId: clientId,
        status:    "COMPLETED",
        subscription: { offer: { type: "PACKAGE" } },
      },
      include: { subscription: { include: { offer: true } } },
    });

    if (!session)
      return res.status(404).json({ message: "Completed package session not found." });

    // Prevent duplicate
    const existing = await prisma.review.findUnique({
      where: { sessionId_patientId: { sessionId, patientId: clientId } },
    });
    if (existing)
      return res.status(409).json({ message: "This session has already been reviewed." });

    const review = await prisma.review.create({
      data: {
        patientId:   clientId,
        nutritionId: session.nutritionId,
        sessionId,
        rating:      parseInt(rating),
        comment:     comment?.trim() || null,
      },
    });

    // Recalculate average
    const agg = await prisma.review.aggregate({
      where: { nutritionId: session.nutritionId },
      _avg:  { rating: true },
    });

    await prisma.resume.update({
      where: { userId: session.nutritionId },
      data:  { ratingAverage: agg._avg.rating ?? 0 },
    });

    return res.status(201).json({ message: "Review submitted successfully.", review });
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const getNutritionReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where:   { nutritionId: req.user.id },
      include: { patient: { select: { id: true, firstName: true, lastName: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const getPublicNutritionReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where:   { nutritionId: req.params.id },
      include: { patient: { select: { id: true, firstName: true, lastName: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const getClientReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where:   { patientId: req.user.id },
      include: { nutrition: { select: { id: true, firstName: true, lastName: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};