const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/projects — Public, with optional filters
router.get("/", async (req, res) => {
  const { category, featured, limit } = req.query;
  const where = {};
  if (category && category !== "All") where.category = category;
  if (featured === "true") where.featured = true;

  try {
    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: limit ? parseInt(limit) : undefined,
    });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:slug — Single project
router.get("/:slug", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// ---- Admin routes below (require JWT auth) ----

// POST /api/projects — Create
router.post("/", authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id — Update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id — Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

module.exports = router;
