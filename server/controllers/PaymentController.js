import prisma from "../prismaClient.js";
import Stripe from "stripe";
import { createZoomMeeting } from "../utils/zoom.js";
import { io, connectedUsers } from "../socket.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res) => {
  try {
    const { subscriptionId, paymentMethodId, sessionDate } = req.body;
    const userId = req.user.id;

    if (!subscriptionId || !paymentMethodId) {
      return res.status(400).json({
        message: "subscriptionId and paymentMethodId are required",
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        offer:     true,
        patient:   true,
        nutrition: { include: { stripe: true } },
      },
    });

    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    if (subscription.patientId !== userId)
      return res.status(403).json({ message: "You cannot pay for this subscription" });

    const { offer, patient, nutrition } = subscription;

    if (!offer)
      return res.status(400).json({ message: "Offer not found" });

    if (Number(offer.price) === 0)
      return res.status(400).json({ message: "This offer is free — no payment needed" });

    const existingPayment = await prisma.payment.findFirst({
      where: { subscriptionId, status: "SUCCESS" },
    });
    if (existingPayment)
      return res.status(400).json({ message: "Subscription already paid" });

    if (subscription.status === "CANCELLED")
      return res.status(400).json({ message: "Subscription is cancelled" });

    const amount = Math.round(Number(offer.price) * 100);

    if (amount < 50)
      return res.status(400).json({ message: "Amount too small — minimum is $0.50" });

    const paymentIntentData = {
      amount,
      currency:       "usd",
      payment_method: paymentMethodId,
      confirm:        true,
      return_url:     `${process.env.CLIENT_URL}/payment-return`,
      metadata: { subscriptionId, userId, offerType: offer.type },
    };

    // Stripe Connect — send to nutritionist's account
    if (["CONSULTATION", "PLAN", "PACKAGE"].includes(offer.type)) {
      const stripeAccountId = nutrition?.stripe?.stripeAccountId;
      if (!stripeAccountId)
        return res.status(400).json({ message: "Nutritionist Stripe account not linked" });
      paymentIntentData.transfer_data = { destination: stripeAccountId };
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentData,
      { idempotencyKey: `payment_${subscriptionId}_${Date.now()}` }
    );

    if (paymentIntent.status === "requires_action") {
      return res.json({
        requiresAction: true,
        clientSecret:   paymentIntent.client_secret,
      });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment not completed",
        status:  paymentIntent.status,
      });
    }

    // ── Pre-transaction: prepare CONSULTATION zoom link ──
    let consultationZoomLink  = null;
    let consultationScheduled = null;

    if (offer.type === "CONSULTATION") {
      if (sessionDate && new Date(sessionDate) <= new Date())
        return res.status(400).json({ message: "Session date must be in the future" });

      consultationScheduled = sessionDate
        ? new Date(sessionDate)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const conflict = await prisma.session.findFirst({
        where: {
          nutritionId: subscription.nutritionId,
          status:      { not: "CANCELLED" },
          sessionDate: consultationScheduled,
        },
      });
      if (conflict)
        return res.status(409).json({ message: "This time slot is already booked" });

      consultationZoomLink = await createZoomMeeting(
        nutrition.email || "",
        patient.email   || "",
        offer.name      || ""
      );
    }

    // ── Pre-transaction: prepare PACKAGE zoom links ──
    let packageSessions = [];

    if (offer.type === "PACKAGE") {
      if (!sessionDate || !Array.isArray(sessionDate))
        return res.status(400).json({
          message: "sessionDate must be an array of dates for package offers",
        });

      const maxSessions = offer.sessionsCount || 1;
      const dates = sessionDate.slice(0, maxSessions);

      for (const date of dates) {
        const scheduledDate = new Date(date);

        if (scheduledDate <= new Date())
          return res.status(400).json({ message: `Session date ${date} must be in the future` });

        const conflict = await prisma.session.findFirst({
          where: {
            nutritionId: subscription.nutritionId,
            status:      { not: "CANCELLED" },
            sessionDate: scheduledDate,
          },
        });
        if (conflict)
          return res.status(409).json({ message: `Time slot ${date} is already booked` });

        const zoomLink = await createZoomMeeting(
          nutrition.email || "",
          patient.email   || "",
          offer.name      || ""
        );

        packageSessions.push({ scheduledDate, zoomLink });
      }
    }

    // ── DB Transaction ──
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Record payment
      const payment = await tx.payment.create({
        data: {
          subscriptionId,
          amount:        offer.price || 0,
          status:        "SUCCESS",
          paymentMethod: "stripe",
          transactionId: paymentIntent.id,
        },
      });

      // 2️⃣ Activate subscription
      await tx.subscription.update({
        where: { id: subscriptionId },
        data:  { status: "ACTIVE", startDate: new Date() },
      });

      let session  = null;
      let sessions = [];

      // 3️⃣ PLAN — create UserPlan
      if (offer.type === "PLAN") {
        const plan = await tx.plan.findUnique({ where: { offerId: subscription.offerId } });
        if (!plan) throw new Error("Plan not found");
        await tx.userPlan.create({
          data: {
            userId:         subscription.patientId,
            planId:         plan.id,
            subscriptionId: subscription.id,
            startDate:      new Date(),
          },
        });
      }

      // 4️⃣ CONSULTATION — create one session
      if (offer.type === "CONSULTATION") {
        session = await tx.session.create({
          data: {
            subscriptionId,
            patientId:   subscription.patientId,
            nutritionId: subscription.nutritionId,
            sessionDate: consultationScheduled,
            zoomLink:    consultationZoomLink,
            status:      "SCHEDULED",
          },
        });
      }

      // 5️⃣ PACKAGE — create multiple sessions
      if (offer.type === "PACKAGE") {
        for (const { scheduledDate, zoomLink } of packageSessions) {
          const s = await tx.session.create({
            data: {
              subscriptionId,
              patientId:   subscription.patientId,
              nutritionId: subscription.nutritionId,
              sessionDate: scheduledDate,
              zoomLink,
              status:      "SCHEDULED",
            },
          });
          sessions.push(s);
        }
      }

      return { payment, session, sessions };
    });

    // ── Real-time notifications ──
    if (offer.type === "CONSULTATION" && result.session) {
      const patientSocketId   = connectedUsers.get(subscription.patientId);
      const nutritionSocketId = connectedUsers.get(subscription.nutritionId);

      if (patientSocketId)
        io.to(patientSocketId).emit("sessionBooked", {
          session: result.session,
          message: "Your consultation has been scheduled",
        });

      if (nutritionSocketId)
        io.to(nutritionSocketId).emit("newConsultation", {
          session: result.session,
          patientName: `${patient.firstName} ${patient.lastName}`,
        });
    }

    if (offer.type === "PACKAGE" && result.sessions.length > 0) {
      const patientSocketId   = connectedUsers.get(subscription.patientId);
      const nutritionSocketId = connectedUsers.get(subscription.nutritionId);

      if (patientSocketId)
        io.to(patientSocketId).emit("packageBooked", {
          sessions: result.sessions,
          message:  "Your package sessions have been scheduled",
        });

      if (nutritionSocketId)
        io.to(nutritionSocketId).emit("newPackageSubscriber", {
          sessions:    result.sessions,
          patientName: `${patient.firstName} ${patient.lastName}`,
          offerName:   offer.name,
        });
    }

    return res.json({
      message:
        offer.type === "CONSULTATION" ? "Payment successful, consultation scheduled" :
        offer.type === "PACKAGE"      ? "Payment successful, sessions scheduled" :
                                        "Payment successful",
      payment:  result.payment,
      session:  result.session,
      sessions: result.sessions,
    });

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where:   { subscription: { patientId: userId } },
      include: {
        subscription: {
          include: {
            offer:     true,
            nutrition: {
              select: { id: true, firstName: true, lastName: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;

    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: {
        subscription: {
          include: { offer: true, patient: true, nutrition: true, sessions: true },
        },
      },
    });

    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    if (req.user.role !== "ADMIN" && payment.subscription.patientId !== userId)
      return res.status(403).json({ message: "Access forbidden" });

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};