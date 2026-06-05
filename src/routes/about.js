const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/about — Public, returns the active about section
router.get("/", async (req, res) => {
  try {
    const about = await prisma.about.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ about });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch about section data" });
  }
});

// GET /api/about/all — Admin, returns all about profiles
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const abouts = await prisma.about.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ abouts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch about profiles" });
  }
});

// POST /api/about — Create
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.body.isActive) {
      await prisma.about.updateMany({ data: { isActive: false } });
    }
    const about = await prisma.about.create({ data: req.body });
    res.status(201).json({ about });
  } catch (err) {
    res.status(500).json({ error: "Failed to create about profile" });
  }
});

// PUT /api/about/:id — Update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.body.isActive) {
      await prisma.about.updateMany({ data: { isActive: false } });
    }
    const about = await prisma.about.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ about });
  } catch (err) {
    res.status(500).json({ error: "Failed to update about profile" });
  }
});

// DELETE /api/about/:id — Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.about.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete about profile" });
  }
});

module.exports = router;
