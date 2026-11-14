import "dotenv/config";

import app from "./app.js";
import connectDB from "./database/db.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    server.on("error", (err) => {
      console.error("Server listen error:", err);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
