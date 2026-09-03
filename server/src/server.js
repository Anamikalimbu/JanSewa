/**
 * server.js — Entry point for JanSewa backend
 *
 * Responsibilities:
 *  1. Load environment variables
 *  2. Connect to MongoDB
 *  3. Start the HTTP server
 *
 * The Express app itself lives in src/app.js to keep this file clean
 * and to make it easy to import `app` in tests without starting a server.
 */

require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

// If this doesn't match your .env file's CLIENT_URL, something in your
// shell/system environment is overriding it — that's the CORS culprit.
console.log(`CLIENT_URL resolved to: ${process.env.CLIENT_URL}`);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n JanSewa API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health\n`);
  });

  // Handle unexpected errors that slip through (fail-safe)
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise Rejection:", reason);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });
};

startServer();