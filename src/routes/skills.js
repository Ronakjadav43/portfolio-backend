const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/skills — Public
router.get("/", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }, { proficiency: "desc" }],
    });
    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

// GET /api/skills/:id — Single skill
router.get("/:id", async (req, res) => {
  try {
    const skill = await prisma.skill.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json({ skill });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skill" });
  }
});

// ---- Admin routes below (require JWT auth) ----

// POST /api/skills — Create
router.post("/", authMiddleware, async (req, res) => {
  try {
    const skill = await prisma.skill.create({ data: req.body });
    res.status(201).json({ skill });
  } catch (err) {
    res.status(500).json({ error: "Failed to create skill" });
  }
});

// PUT /api/skills/:id — Update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const skill = await prisma.skill.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ skill });
  } catch (err) {
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// DELETE /api/skills/:id — Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

module.exports = router;
