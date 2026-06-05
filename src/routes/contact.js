const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { sendContactEmail } = require("../utils/mailer");

const prisma = new PrismaClient();

// POST /api/contact — Submit contact form
router.post(
  "/",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 chars"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("phone").optional().trim(),
    body("subject").trim().isLength({ min: 5, max: 200 }).withMessage("Subject must be 5-200 chars"),
    body("message").trim().isLength({ min: 20, max: 5000 }).withMessage("Message must be 20-5000 chars"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, phone, subject, message } = req.body;

    try {
      // Save to database
      const contact = await prisma.contactMessage.create({
        data: { name, email, phone: phone || null, subject, message },
      });

      // Send email notification (non-blocking)
      sendContactEmail({ name, email, phone, subject, message }).catch((err) => {
        console.error("Email notification failed:", err.message);
      });

      res.status(201).json({
        success: true,
        id: contact.id,
        message: "Message received! I'll get back to you within 24 hours.",
      });
    } catch (err) {
      console.error("Contact POST error:", err);
      res.status(500).json({ error: "Failed to save message" });
    }
  }
);
module.exports = router;
