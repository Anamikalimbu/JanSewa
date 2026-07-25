import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Handle uncaught synchronous exceptions
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Bootstraps the application:
 * 1. Connect to MongoDB
 * 2. Start the Express server
 */
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 JanSewa API server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections gracefully
  process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on termination signals
  process.on("SIGTERM", () => {
    console.log("👋 SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("💤 Process terminated.");
    });
  });
};

startServer();
