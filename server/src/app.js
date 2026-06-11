const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

// Route imports
const userRoutes = require("./routes/userRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Middleware imports
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security Middleware

// Set secure HTTP headers (XSS, clickjacking, etc.)
app.use(helmet());

// CORS — allow requests from the React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Required for cookies/sessions (Week 3)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request Parsing

app.use(express.json({ limit: "10mb" }));           // JSON body parser
app.use(express.urlencoded({ extended: true }));     // Form data

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

// API Routes

const API_PREFIX = "/api";

app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/complaints`, complaintRoutes);
app.use(`${API_PREFIX}/departments`, departmentRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

// Error Handling (must be LAST)

app.use(notFound);      // Catches unmatched routes → 404 AppError
app.use(errorHandler);  // Global error response handler

module.exports = app;
