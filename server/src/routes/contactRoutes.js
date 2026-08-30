const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const ContactMessage = require("../models/ContactMessage");
const sendEmail = require("../utils/sendEmail");
const { ROLES, CONTACT_STATUSES } = require("../constants");

const router = express.Router();

/**
 * POST /api/contact
 * Public — the Contact page form. No account required. Best-effort emails
 * the support inbox; if SMTP isn't configured the message is still saved,
 * so nothing is ever silently lost.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      throw new AppError("Name, email and message are required.", 400);
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject: subject || "General Inquiry",
      message,
    });

    try {
      await sendEmail({
        to: process.env.SUPPORT_EMAIL || "support@jansewa.gov.np",
        subject: `[JanSewa Contact] ${contactMessage.subject}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
      });
    } catch {
      // Message is already saved — a failed notification email shouldn't
      // fail the request from the citizen's point of view.
    }

    sendSuccess(res, 201, "Thanks for reaching out — we'll get back to you soon.", {
      contactMessage,
    });
  })
);

/**
 * GET /api/contact
 * Admin only — review incoming contact messages.
 */
router.get(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    sendPaginated(res, messages, page, limit, total, "Contact messages fetched");
  })
);

/**
 * PATCH /api/contact/:id/status
 * Admin only — mark a message reviewed.
 */
router.patch(
  "/:id/status",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!Object.values(CONTACT_STATUSES).includes(status)) {
      throw new AppError(`Status must be one of: ${Object.values(CONTACT_STATUSES).join(", ")}`, 400);
    }

    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) throw new AppError("Message not found.", 404);
    sendSuccess(res, 200, "Message updated.", { message });
  })
);

module.exports = router;
