const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/services — Public
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: "asc" },
    });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET /api/services/:id — Single service
router.get("/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

// ---- Admin routes below (require JWT auth) ----

// POST /api/services — Create
router.post("/", authMiddleware, async (req, res) => {
  try {
    const service = await prisma.service.create({ data: req.body });
    res.status(201).json({ service });
  } catch (err) {
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PUT /api/services/:id — Update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const service = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE /api/services/:id — Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

module.exports = router;
