const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();

/**
 * GET /api/users
 * Placeholder (auth + RBAC)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Users route is active — implementation coming ", {
      users: [],
    });
  })
);

/**
 * GET /api/users/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Get user by ID", { userId: req.params.id });
  })
);

module.exports = router;
