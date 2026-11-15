import "dotenv/config";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./database/db.js";

const PORT = process.env.PORT || 8000;

let server = null;
let isShuttingDown = false;

// DB-03: Graceful Server Shutdown Handler
export const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.warn(`⚠️ Shutdown already in progress. Ignoring subsequent signal: ${signal}`);
    return;
  }
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Starting graceful server shutdown...`);

  // Force process exit after 10s maximum grace window
  const forceExitTimeout = setTimeout(() => {
    console.error("⏱️ Graceful shutdown timed out (10s limit). Forcing immediate termination.");
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  try {
    // 1. Stop accepting new HTTP requests and wait for in-flight requests to complete
    if (server) {
      console.log("⏹️ Closing HTTP server and allowing in-flight requests to complete...");
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log("✅ HTTP server closed successfully.");
    }

    // 2. Safely close MongoDB connection pool
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      console.log("⏹️ Closing MongoDB connection pool...");
      await mongoose.connection.close(false);
      console.log("✅ MongoDB connection closed successfully.");
    }

    console.log("👋 Graceful shutdown complete. Exiting cleanly.");
    clearTimeout(forceExitTimeout);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error encountered during graceful shutdown:", error.message);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
};

// Start server when executed directly (not when imported during unit tests)
const isRunningTests = process.env.NODE_ENV === "test" || (process.argv[1] && process.argv[1].includes("test"));

if (!isRunningTests) {
  connectDB()
    .then(() => {
      server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
      server.on("error", (err) => {
        console.error("Server listen error:", err);
      });
    })
    .catch((error) => {
      console.error("Database connection error:", error);
    });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
