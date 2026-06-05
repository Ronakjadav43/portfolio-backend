const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// All admin routes require auth
router.use(authMiddleware);

// GET /api/admin/messages — All contact messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PATCH /api/admin/messages/:id/read — Mark as read
router.patch("/messages/:id/read", async (req, res) => {
  try {
    await prisma.contactMessage.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE /api/admin/messages/:id
router.delete("/messages/:id", async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// GET /api/admin/stats — Dashboard overview stats
router.get("/stats", async (req, res) => {
  try {
    const [totalMessages, unreadMessages, totalProjects, totalPosts] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.project.count(),
      prisma.blog.count({ where: { published: true } }),
    ]);

    res.json({
      totalMessages,
      unreadMessages,
      totalProjects,
      totalPosts,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// PUT /api/admin/settings — Update site settings
router.put("/settings", async (req, res) => {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...req.body },
      update: req.body,
    });
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
