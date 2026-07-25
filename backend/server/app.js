import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// ==========================
// Security Middleware
// ==========================
app.use(helmet()); // Sets various secure HTTP headers
app.use(mongoSanitize()); // Prevents NoSQL injection (strips $ and . from req data)
app.use(xss()); // Sanitizes user input from malicious HTML/JS

// Rate limiting to prevent brute-force / DoS attacks
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

// ==========================
// CORS Configuration
// ==========================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow cookies (refresh token) to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================
// Core Middleware
// ==========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ==========================
// Health Check
// ==========================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JanSewa API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// ==========================
// API Routes
// ==========================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// ==========================
// Error Handling
// ==========================
app.use(notFound);
app.use(errorHandler);

export default app;
