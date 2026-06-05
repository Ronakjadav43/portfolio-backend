const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /api/settings — Public
router.get("/", async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

module.exports = router;
