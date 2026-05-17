import prisma from "../prismaClient.js";

// ==============================
// 1️⃣ Create Client Post (CLIENT only)
// ==============================
export const createClientPost = async (req, res) => {
  try {
    const { title, content, type, images } = req.body;
    const authorId = req.user.id;

    if (!title || !content)
      return res.status(400).json({ message: "Title and content are required" });

    if (type && !["RECIPE", "EXPERIENCE", "BEFORE_AFTER"].includes(type))
      return res.status(400).json({ message: "Invalid type. Must be RECIPE, EXPERIENCE or BEFORE_AFTER" });

    const post = await prisma.clientPost.create({
      data: {
        authorId,
        title,
        content,
        type:   type ?? "EXPERIENCE",
        images: images ?? [],
        status: "PENDING",
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
      },
    });

    // Notify admins that a new post is waiting for review
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId:  admin.id,
          title:   "New Community Post Pending Review 📝",
          message: `${post.author.firstName} ${post.author.lastName} submitted a new post: "${title}"`,
        })),
      });
    }

    res.status(201).json({ post });
  } catch (err) {
    console.error("createClientPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 2️⃣ Get all APPROVED posts (public)
// ==============================
export const getAllClientPosts = async (req, res) => {
  try {
    const { type } = req.query;

    if (type && !["RECIPE", "EXPERIENCE", "BEFORE_AFTER"].includes(type))
      return res.status(400).json({ message: "Invalid type filter" });

    const posts = await prisma.clientPost.findMany({
      where: {
        status: "APPROVED",
        ...(type ? { type } : {}),
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ posts });
  } catch (err) {
    console.error("getAllClientPosts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 3️⃣ Get single post by ID
// ==============================
export const getClientPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.clientPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only author or admin can see non-approved posts
    if (
      post.status !== "APPROVED" &&
      req.user?.role !== "ADMIN" &&
      req.user?.id !== post.authorId
    )
      return res.status(403).json({ message: "Access forbidden" });

    res.json({ post });
  } catch (err) {
    console.error("getClientPostById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 4️⃣ Get my posts (CLIENT — own posts)
// ==============================
export const getMyClientPosts = async (req, res) => {
  try {
    const posts = await prisma.clientPost.findMany({
      where:   { authorId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ posts });
  } catch (err) {
    console.error("getMyClientPosts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 5️⃣ Get all PENDING posts (ADMIN only)
// ==============================
export const getPendingClientPosts = async (req, res) => {
  try {
    const posts = await prisma.clientPost.findMany({
      where:   { status: "PENDING" },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ posts });
  } catch (err) {
    console.error("getPendingClientPosts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 6️⃣ Approve or Reject a post (ADMIN only)
// ==============================
export const updateClientPostStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status))
      return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });

    const post = await prisma.clientPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const updated = await prisma.clientPost.update({
      where: { id },
      data:  { status },
    });

    // Notify the client of the decision
    await prisma.notification.create({
      data: {
        userId:  post.authorId,
        title:   status === "APPROVED" ? "Post Approved ✅" : "Post Rejected ❌",
        message: status === "APPROVED"
          ? `Your post "${post.title}" is now live on the community page!`
          : `Your post "${post.title}" was not approved. Please review our community guidelines.`,
      },
    });

    res.json({ post: updated });
  } catch (err) {
    console.error("updateClientPostStatus error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 7️⃣ Update own post (CLIENT — own posts only)
// ==============================
export const updateClientPost = async (req, res) => {
  try {
    const { id }                    = req.params;
    const { title, content, images } = req.body;

    const post = await prisma.clientPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorId !== req.user.id)
      return res.status(403).json({ message: "You can only edit your own posts" });

    const data = {
      ...(title   !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(images  !== undefined && { images }),
      // Reset to PENDING on edit so admin re-reviews
      status: "PENDING",
    };

    const updated = await prisma.clientPost.update({ where: { id }, data });

    res.json({
      message: "Post updated and sent back for review",
      post:    updated,
    });
  } catch (err) {
    console.error("updateClientPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 8️⃣ Delete post (CLIENT own, or ADMIN)
// ==============================
export const deleteClientPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.clientPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Access forbidden" });

    await prisma.clientPost.delete({ where: { id } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("deleteClientPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};