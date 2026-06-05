const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/experience — Public
router.get("/", async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    res.json({ experiences });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

// GET /api/experience/:id — Single experience
router.get("/:id", async (req, res) => {
  try {
    const experience = await prisma.experience.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!experience) return res.status(404).json({ error: "Experience not found" });
    res.json({ experience });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

// ---- Admin routes below (require JWT auth) ----

// POST /api/experience — Create
router.post("/", authMiddleware, async (req, res) => {
  try {
    const experience = await prisma.experience.create({ data: req.body });
    res.status(201).json({ experience });
  } catch (err) {
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// PUT /api/experience/:id — Update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const experience = await prisma.experience.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ experience });
  } catch (err) {
    res.status(500).json({ error: "Failed to update experience" });
  }
});

// DELETE /api/experience/:id — Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.experience.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete experience" });
  }
});

module.exports = router;
