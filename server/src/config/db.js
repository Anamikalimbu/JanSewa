const mongoose = require("mongoose");

/**
 * Establishes connection to MongoDB.
 * Supports graceful shutdown for SIGINT / SIGTERM signals.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are defaults in Mongoose 8+, kept here for clarity
      // and easy override in future versions.
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Graceful shutdown — close DB connection before process exits
    const gracefulShutdown = (signal) => {
      mongoose.connection.close(() => {
        console.log(`🔌 MongoDB disconnected due to ${signal}. Shutting down.`);
        process.exit(0);
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure — server cannot run without DB
  }
};

// Log mongoose connection events for observability
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected.");
});

module.exports = connectDB;
