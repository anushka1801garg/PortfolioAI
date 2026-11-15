import mongoose from "mongoose";

// DB-02: Mongoose Connection Pool & Timeout Configurations
export const MONGOOSE_CONNECTION_OPTIONS = {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let isEventListenersAttached = false;

const attachConnectionEventListeners = () => {
  if (isEventListenersAttached) return;

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Attempting automatic reconnection...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB reconnected successfully.");
  });

  isEventListenersAttached = true;
};

// Initialize listeners on module load
attachConnectionEventListeners();

const connectDB = async () => {
  try {
    // Prevent duplicate connection initialization if already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI environment variable is missing. Please set MONGODB_URI in your cloud host environment variables."
      );
    }

    attachConnectionEventListeners();

    console.log("Connecting to MongoDB Atlas...");
    const connection = await mongoose.connect(
      process.env.MONGODB_URI,
      MONGOOSE_CONNECTION_OPTIONS
    );

    console.log(
      `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`
    );
    return connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
