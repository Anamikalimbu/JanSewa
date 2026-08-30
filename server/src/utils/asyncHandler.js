/**
 * utils/asyncHandler.js
 *
 * Wraps async route handlers so unhandled promise rejections
 * are forwarded to Express's global error handler automatically.
 *
 * Without this, every controller needs its own try/catch.
 * With this, controllers stay clean and errors bubble up correctly.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => {
 *     const data = await SomeModel.find();
 *     res.json({ data });
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
