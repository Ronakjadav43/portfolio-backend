const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/blog — Public posts
router.get("/", async (req, res) => {
  const { category } = req.query;
  const where = { published: true };
  if (category && category !== "All") where.category = category;

  try {
    const posts = await prisma.blog.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, excerpt: true, category: true, readTime: true, coverImage: true, publishedAt: true, createdAt: true },
    });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/blog/:slug — Single post
router.get("/:slug", async (req, res) => {
  try {
    const post = await prisma.blog.findUnique({
      where: { slug: req.params.slug, published: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/blog — Create (admin)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.blog.create({
      data: {
        ...req.body,
        publishedAt: req.body.published ? new Date() : null,
      },
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/blog/:id — Update (admin)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.blog.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/blog/:id — Delete (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.blog.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

module.exports = router;
