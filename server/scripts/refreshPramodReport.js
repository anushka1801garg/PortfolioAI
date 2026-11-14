import mongoose from "mongoose";
import dotenv from "dotenv";
import { analyzePortfolioComprehensive } from "../src/services/gemini.service.js";
dotenv.config();

async function refreshReport() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Portfolio = mongoose.model("Portfolio", new mongoose.Schema({}, { strict: false }));

  const pramod = await Portfolio.findOne({
    $or: [
      { _id: "6ac50d42b79658e9ac3e6586" },
      { name: "Pramod Garg" },
      { title: /Pramod/i }
    ]
  });

  if (!pramod) {
    console.log("Pramod portfolio not found");
    process.exit(1);
  }

  const analysis = await analyzePortfolioComprehensive(pramod.toObject(), {
    targetRole: pramod.targetRole || "Chief Manager F&A and HR",
    targetCompany: pramod.targetCompany || "LYONS ENGINEERING PVT. LTD"
  });

  await Portfolio.findByIdAndUpdate(pramod._id, {
    $set: {
      analysisReport: {
        ...analysis,
        targetRole: pramod.targetRole || "Chief Manager F&A and HR",
        targetCompany: pramod.targetCompany || "LYONS ENGINEERING PVT. LTD",
        analyzedAt: new Date()
      }
    }
  });

  console.log("Successfully refreshed Pramod Garg analysisReport in MongoDB!");
  console.log("New Suggested Bio:", analysis.contentSuggestions.find(s => s.field === "about")?.suggested);
  process.exit(0);
}

refreshReport().catch(err => {
  console.error(err);
  process.exit(1);
});
