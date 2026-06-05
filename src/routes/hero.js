const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/hero — Public, returns the active hero section
router.get("/", async (req, res) => {
  try {
    const hero = await prisma.hero.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    // If no hero found, return a default one or null
    res.json({ hero });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hero section data" });
  }
});

// GET /api/hero/all — Admin, returns all heroes
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const heroes = await prisma.hero.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ heroes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch heroes" });
  }
});

// POST /api/hero — Create
router.post("/", authMiddleware, async (req, res) => {
  try {
    // If the new one is active, deactivate others
    if (req.body.isActive) {
      await prisma.hero.updateMany({ data: { isActive: false } });
    }
    const hero = await prisma.hero.create({ data: req.body });
    res.status(201).json({ hero });
  } catch (err) {
    res.status(500).json({ error: "Failed to create hero" });
  }
});

// PUT /api/hero/:id — Update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.body.isActive) {
      await prisma.hero.updateMany({ data: { isActive: false } });
    }
    const hero = await prisma.hero.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ hero });
  } catch (err) {
    res.status(500).json({ error: "Failed to update hero" });
  }
});

// DELETE /api/hero/:id — Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.hero.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete hero" });
  }
});

module.exports = router;
