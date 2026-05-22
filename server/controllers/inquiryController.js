import prisma from "../prismaClient.js";

export const createInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.user?.id ?? null;
    const finalName  = name  ?? req.user?.firstName ?? null;
    const finalEmail = email ?? req.user?.email     ?? null;

    if (!finalName || !finalEmail || !message)
      return res.status(400).json({ message: "Name, email and message are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail))
      return res.status(400).json({ message: "Invalid email address" });

    const inquiry = await prisma.inquiry.create({
      data: { name: finalName, email: finalEmail, message, userId },
    });

    res.status(201).json({ inquiry });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const { resolved } = req.query;
    const where = resolved !== undefined ? { resolved: resolved === "true" } : {};

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ inquiries });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Now accepts an optional adminReply in the body
export const resolveInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;           // ← new

    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Inquiry not found" });

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        resolved: true,
        ...(adminReply ? { adminReply } : {}),  // ← save reply if provided
      },
    });

    res.json({ message: "Inquiry marked as resolved", inquiry });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ message: "Not found" });
    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
