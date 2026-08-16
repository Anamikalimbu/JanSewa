const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect } = require("../middleware/auth");
const Complaint = require("../models/Complaint");
const CATEGORY_META = require("../constants/categoryMeta");
const { callGemini } = require("../utils/geminiClient");

const router = express.Router();

const toComplaintCode = (id) => `CMP${id.toString().slice(-6).toUpperCase()}`;

const MAX_HISTORY_TURNS = 12; // keep the prompt small & cheap
const CODE_PATTERN = /\bCMP[0-9A-F]{6}\b/gi;

const buildSystemInstruction = (user, myComplaints, categoryList) => {
  const complaintLines = myComplaints.length
    ? myComplaints
        .map(
          (c) =>
            `- ${toComplaintCode(c._id)}: "${c.title}" | category: ${c.category} | status: ${c.status} | filed ${new Date(
              c.createdAt
            ).toDateString()}`
        )
        .join("\n")
    : "(This citizen has not filed any complaints yet.)";

  return [
    "You are the JanSewa Assistant, a helpful, concise AI chat assistant embedded in JanSewa — a Nepali municipal " +
      "civic complaint management platform. You help citizens: (1) understand how to report an issue and which " +
      "category/sub-category/priority best fits it, (2) check the status of their own complaints, (3) understand " +
      "what a status (Pending, Assigned, InProgress, Resolved, Closed) means, and (4) general questions about using JanSewa.",
    `You are talking to: ${user.name} (${user.role}).`,
    `Available complaint categories: ${categoryList.join(", ")}.`,
    `This citizen's recent complaints:\n${complaintLines}`,
    "Rules:",
    "- You cannot file a complaint yourself. If the user describes a new issue, recommend a category, sub-category, " +
      'and priority, then tell them to confirm it on the "Submit Complaint" page (you can\'t submit forms or upload photos).',
    "- When asked about a specific complaint status, use the list above; if it's not there, say you can't find it under their account.",
    "- Reply in the same language the citizen writes in (English or Nepali).",
    "- Keep replies short: 2-5 sentences, or a tight bullet list. No markdown headers, minimal formatting.",
    "- Never invent complaint data that isn't in the list above.",
  ].join("\n");
};

/**
 * POST /api/chat/message
 * body: { message: string, history?: [{ role: "user"|"model", text: string }] }
 */
router.post(
  "/message",
  protect,
  asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      throw new AppError("Message is required", 400);
    }

    // Pull a small, relevant slice of this citizen's own complaints for context.
    // If the message references a specific complaint code, make sure that one
    // is included even if it's not among the most recent.
    const mentionedCodes = [...message.matchAll(CODE_PATTERN)].map((m) => m[0].toUpperCase());

    const recentComplaints = await Complaint.find({ userId: req.user._id })
      .select("title category status createdAt")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    let myComplaints = recentComplaints;
    if (mentionedCodes.length) {
      const allMine = await Complaint.find({ userId: req.user._id })
        .select("title category status createdAt")
        .lean();
      const matched = allMine.filter((c) => mentionedCodes.includes(toComplaintCode(c._id)));
      const merged = [...matched, ...recentComplaints];
      const seen = new Set();
      myComplaints = merged.filter((c) => {
        const id = c._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    const categoryList = CATEGORY_META.map((c) => c.label_en);

    const safeHistory = Array.isArray(history)
      ? history
          .filter((h) => h && typeof h.text === "string" && h.text.trim())
          .slice(-MAX_HISTORY_TURNS)
          .map((h) => ({ role: h.role === "model" ? "model" : "user", text: h.text }))
      : [];

    const turns = [...safeHistory, { role: "user", text: message }];

    const reply = await callGemini({
      systemInstruction: buildSystemInstruction(req.user, myComplaints, categoryList),
      turns,
      temperature: 0.5,
      maxOutputTokens: 500,
    });

    sendSuccess(res, 200, "Reply generated", { reply });
  })
);

module.exports = router;
