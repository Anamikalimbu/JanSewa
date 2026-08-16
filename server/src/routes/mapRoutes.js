const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { protect } = require("../middleware/auth");
const Complaint = require("../models/Complaint");
const { callGemini } = require("../utils/geminiClient");

const router = express.Router();

// A short, human-friendly reference shown in the UI (e.g. #CMP4F2A1B)
const toComplaintCode = (id) => `CMP${id.toString().slice(-6).toUpperCase()}`;

/**
 * GET /api/map/complaints
 * All complaints that have a pinned location, shaped for the map view.
 * Any authenticated user can see this — citizens see the same civic
 * picture admins and department staff work from.
 *
 * Query params: category, status, wardNumber (all optional filters)
 */
router.get(
  "/complaints",
  protect,
  asyncHandler(async (req, res) => {
    const { category, status, wardNumber } = req.query;

    const filter = {
      "location.latitude": { $ne: null },
      "location.longitude": { $ne: null },
    };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (wardNumber) filter.wardNumber = wardNumber;

    const complaints = await Complaint.find(filter)
      .select("title category subCategory priority status wardNumber location createdAt")
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    const points = complaints
      .filter((c) => c.location?.latitude != null && c.location?.longitude != null)
      .map((c) => ({
        id: c._id,
        code: toComplaintCode(c._id),
        title: c.title,
        category: c.category,
        subCategory: c.subCategory,
        priority: c.priority,
        status: c.status,
        wardNumber: c.wardNumber,
        address: c.location.address,
        lat: c.location.latitude,
        lng: c.location.longitude,
        createdAt: c.createdAt,
      }));

    sendSuccess(res, 200, "Map points fetched", { points, count: points.length });
  })
);

/**
 * GET /api/map/insights
 * AI-generated hotspot & trend summary. We aggregate complaint counts
 * ourselves (by ward and category) and hand Gemini that compact summary
 * rather than raw complaint text — cheaper, faster, and keeps citizen
 * data minimal in the prompt.
 */
router.get(
  "/insights",
  protect,
  asyncHandler(async (req, res) => {
    const [byWard, byCategory, byCategoryStatus, total] = await Promise.all([
      Complaint.aggregate([
        { $match: { wardNumber: { $ne: "" } } },
        { $group: { _id: "$wardNumber", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        {
          $group: {
            _id: { category: "$category", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
      Complaint.countDocuments(),
    ]);

    if (total === 0) {
      return sendSuccess(res, 200, "No data yet", {
        summary: "There isn't enough complaint data yet to generate hotspot insights.",
        byWard,
        byCategory,
      });
    }

    const aggregateSummary = [
      `Total complaints: ${total}`,
      `By ward (top 10): ${byWard.map((w) => `Ward ${w._id || "N/A"}: ${w.count}`).join(", ") || "none recorded"}`,
      `By category: ${byCategory.map((c) => `${c._id}: ${c.count}`).join(", ")}`,
      `By category & status: ${byCategoryStatus
        .map((cs) => `${cs._id.category}/${cs._id.status}: ${cs.count}`)
        .join(", ")}`,
    ].join("\n");

    const summary = await callGemini({
      systemInstruction:
        "You are a civic data analyst for JanSewa, a Nepali municipal complaint platform. " +
        "Given aggregate complaint statistics (never raw personal data), write a short, plain-language " +
        "briefing for city officials: 1) which wards/categories are hotspots, 2) any notable pattern or " +
        "risk (e.g. a category stuck unresolved), 3) one concrete recommendation. " +
        "Keep it under 150 words, use short paragraphs or a few bullet points, no markdown headers.",
      turns: [{ role: "user", text: `Here is the current aggregate complaint data:\n\n${aggregateSummary}` }],
      temperature: 0.4,
      maxOutputTokens: 400,
    });

    sendSuccess(res, 200, "Insights generated", { summary, byWard, byCategory });
  })
);

module.exports = router;
