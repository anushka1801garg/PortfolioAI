import dotenv from "dotenv";
dotenv.config();
import connectDB from "../database/db.js";
import Portfolio from "../models/portfolio.model.js";

async function run() {
  await connectDB();
  const res = await Portfolio.updateMany(
    {},
    {
      $set: {
        status: "Published",
        isPublic: true,
      },
    }
  );
  console.log(`Successfully made all ${res.modifiedCount} portfolios Published & Public! ✅`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
