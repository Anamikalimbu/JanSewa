/**
 * middleware/sanitizeBody.js
 *
 * Lightweight stand-in for express-mongo-sanitize + xss-clean.
 *
 * Those packages try to reassign req.query/req.params, which Express 5
 * exposes as read-only getters — doing so throws
 * "Cannot set property query of #<IncomingMessage> which has only a getter".
 * This middleware gives the same practical protection (stripping Mongo
 * operator keys like "$where"/"$gt" and basic HTML/script tags) but only
 * ever mutates req.body, which Express 5 still allows to be reassigned.
 */
const MONGO_OPERATOR_KEY = /^\$/;
const HTML_TAG = /<\/?[a-z][\s\S]*?>/gi;

const stripHtml = (value) => value.replace(HTML_TAG, "");

const sanitizeValue = (value) => {
  if (typeof value === "string") return stripHtml(value);

  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      // Drop keys like "$where" or "a.b" that could be used for a
      // Mongo operator injection instead of a plain field name.
      if (MONGO_OPERATOR_KEY.test(key) || key.includes(".")) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }

  return value;
};

const sanitizeBody = () => (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};

module.exports = sanitizeBody;
