import prisma from "../prismaClient.js";
import { io, connectedUsers } from "../socket.js";

export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { otherUserId } = req.body;

    if (!otherUserId)
      return res.status(400).json({ message: "otherUserId is required" });

    const patientId = role === "CLIENT" ? userId : otherUserId;
    const nutritionId = role === "NUTRITION" ? userId : otherUserId;

    if (role === "CLIENT") {
      const hasSubscription = await prisma.subscription.findFirst({
        where: {
          patientId,
          nutritionId,
          status: { in: ["ACTIVE", "EXPIRED", "CANCELLED"] },
          offer: { type: { in: ["CONSULTATION", "PLAN", "PACKAGE"] } },
        },
      });
      if (!hasSubscription)
        return res.status(403).json({
          message: "You can only chat with a nutritionist after subscribing to one of their offers",
        });
    }

    const conversation = await prisma.conversation.upsert({
      where: { patientId_nutritionId: { patientId, nutritionId } },
      update: {},
      create: { patientId, nutritionId },
      include: {
        patient:   { select: { id: true, firstName: true, lastName: true, image: true } },
        nutrition: { select: { id: true, firstName: true, lastName: true, image: true } },
      },
    });

    res.json({ conversation });
  } catch (err) {
    console.error("getOrCreateConversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const role   = req.user.role;

    const where = role === "CLIENT" ? { patientId: userId } : { nutritionId: userId };

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        patient:   { select: { id: true, firstName: true, lastName: true, image: true } },
        nutrition: { select: { id: true, firstName: true, lastName: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ conversations });
  } catch (err) {
    console.error("getMyConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = String(req.user.id); // ✅ normalize to string

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // ✅ String() comparison to handle type mismatches
    if (
      String(conversation.patientId)   !== userId &&
      String(conversation.nutritionId) !== userId
    )
      return res.status(403).json({ message: "Access forbidden" });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, image: true } },
      },
    });

    await prisma.message.updateMany({
      where: { conversationId, isRead: false, senderId: { not: userId } },
      data: { isRead: true },
    });

    res.json({ messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content }        = req.body;
    const senderId           = String(req.user.id);

    if (!content)
      return res.status(400).json({ message: "Message content is required" });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    if (
      String(conversation.patientId)   !== senderId &&
      String(conversation.nutritionId) !== senderId
    )
      return res.status(403).json({ message: "Access forbidden" });

    // ✅ NO subscription check here — if the conversation exists, they already passed that check

    const receiverId =
      String(conversation.patientId) === senderId
        ? conversation.nutritionId
        : conversation.patientId;

    const message = await prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, image: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data:  { updatedAt: new Date() },
    });

    const notification = await prisma.notification.create({
      data: {
        userId:  receiverId,
        title:   "New Message",
        message: `${message.sender.firstName} sent you a message`,
        link:    `/conversations/${conversationId}`,
      },
    });

    const receiverSocketId = connectedUsers.get(String(receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notification", notification);
      io.to(receiverSocketId).emit("new_message", message);
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = String(req.user.id); // ✅ normalize

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // ✅ String() comparison
    if (
      String(conversation.patientId)   !== userId &&
      String(conversation.nutritionId) !== userId
    )
      return res.status(403).json({ message: "Access forbidden" });

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message)
      return res.status(404).json({ message: "Message not found" });

    if (message.conversationId !== conversationId)
      return res.status(400).json({ message: "Message does not belong to this conversation" });

    // ✅ String() comparison
    if (String(message.senderId) !== userId)
      return res.status(403).json({ message: "You can only delete your own messages" });

    await prisma.message.delete({ where: { id: messageId } });

    const otherUserId =
      String(conversation.patientId) === userId
        ? conversation.nutritionId
        : conversation.patientId;

    const otherSocketId = connectedUsers.get(otherUserId);
    if (otherSocketId) {
      io.to(otherSocketId).emit("message_deleted", { messageId, conversationId });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = String(req.user.id); // ✅ normalize

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // ✅ String() comparison
    if (
      String(conversation.patientId)   !== userId &&
      String(conversation.nutritionId) !== userId
    )
      return res.status(403).json({ message: "Access forbidden" });

    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });

    const otherUserId =
      String(conversation.patientId) === userId
        ? conversation.nutritionId
        : conversation.patientId;

    const otherSocketId = connectedUsers.get(otherUserId);
    if (otherSocketId) {
      io.to(otherSocketId).emit("conversation_deleted", { conversationId });
    }

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("deleteConversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};