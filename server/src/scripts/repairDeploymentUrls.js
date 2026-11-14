import dotenv from "dotenv";
dotenv.config();
import connectDB from "../database/db.js";
import Portfolio from "../models/portfolio.model.js";

async function run() {
  await connectDB();
  const portfolios = await Portfolio.find({
    deployedUrl: { $regex: "netlify\\.app|vercel\\.app|github\\.io" },
  });
  console.log(`Found ${portfolios.length} portfolios with legacy third-party deployment URLs.`);
  for (const p of portfolios) {
    const oldUrl = p.deployedUrl;
    const clientBase = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    p.deployedUrl = `${clientBase}/p/${p._id}`;
    p.deploymentStatus = "Live";
    p.status = "Published";
    p.isPublic = true;
    p.deployedAt = p.deployedAt || new Date();
    await p.save();
    console.log(`✓ Repaired portfolio [${p.title}]: ${oldUrl} -> ${p.deployedUrl}`);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
