const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const sanitizeBody = require("./middleware/sanitizeBody");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const mapRoutes = require("./routes/mapRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware imports
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security Middleware

// Set secure HTTP headers (XSS, clickjacking, etc.)
// crossOriginResourcePolicy is relaxed to "cross-origin" so uploaded
// complaint images can be loaded by the frontend, which runs on a
// different origin/port in development.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Rate limiting to prevent brute-force / DoS attacks on the API
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  skip: () => process.env.NODE_ENV !== "production",
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

// CORS — allow requests from the React frontend
//
// We build a whitelist instead of trusting a single env var, because
// CLIENT_URL can get silently overridden by a stray shell/system
// environment variable (dotenv never overwrites an already-set var).
// This way local dev keeps working no matter what CLIENT_URL resolves to.
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl/Postman) which send no Origin header
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true, // Required for cookies/sessions (Week 3)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request Parsing

app.use(express.json({ limit: "10mb" }));           // JSON body parser
app.use(express.urlencoded({ extended: true }));     // Form data

// Prevent NoSQL injection ($/. keys) and strip malicious HTML/JS from
// request bodies. (Sanitizes req.body only — Express 5 makes req.query
// read-only, which is why the express-mongo-sanitize/xss-clean packages
// this was adapted from can't be used directly here.)
app.use(sanitizeBody());

// HTTP Request Logging

// 'dev' format in development, 'combined' (Apache style) in production
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Health Check

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JanSewa API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Uploaded complaint images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes

const API_PREFIX = "/api";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/complaints`, complaintRoutes);
app.use(`${API_PREFIX}/departments`, departmentRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/map`, mapRoutes);
app.use(`${API_PREFIX}/chat`, chatRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Error Handling (must be LAST)

app.use(notFound);      // Catches unmatched routes → 404 AppError
app.use(errorHandler);  // Global error response handler

module.exports = app;