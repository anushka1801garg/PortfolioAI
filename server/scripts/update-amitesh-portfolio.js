import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import path from "path";
import { extractTextFromPDF } from "../src/services/pdf.service.js";
import { generatePortfolioFromResume } from "../src/services/portfolioGenerator.service.js";
import Portfolio from "../src/models/portfolio.model.js";

async function updateAmitesh() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI not found in env");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const portfolioId = "6ad86f4ce0f5c5049eba7771";
  const existing = await Portfolio.findById(portfolioId);
  if (!existing) {
    console.error(`Portfolio ${portfolioId} not found!`);
    process.exit(1);
  }
  console.log("Found existing portfolio:", existing.title, "User:", existing.user);

  const filePath = path.resolve("scripts/amitesh_resume.pdf");
  const text = await extractTextFromPDF(filePath);

  console.log("Generating genuine portfolio from Amitesh Pandey resume...");
  const result = await generatePortfolioFromResume(text, {
    originalFilename: "Amitesh_Pandey_Resume.pdf",
    inputSource: "resume",
  });

  const p = result.portfolio;

  // Clean and format skills (deduping and removing any trailing period)
  const cleanedSkills = Array.from(
    new Set(
      (p.skills || [])
        .map((s) => s.replace(/\.$/, "").replace(/\s*Skills?$/i, "").trim())
        .filter((s) => s.length >= 3 && !/Excel\)/i.test(s) && !s.includes("Final Bill") && !s.includes("Prepare Client RA"))
    )
  );
  cleanedSkills.push("Client RA & Final Bill", "BOQ Preparation", "AutoCAD");

  existing.name = "Amitesh Pandey";
  existing.title = "Amitesh Pandey's Portfolio (Civil Engineer)";
  existing.targetRole = "Civil Engineer";
  existing.targetCompany = "";
  existing.tagline = p.hero?.tagline || p.tagline || "Civil Engineer with 5+ years of experience in site execution, construction management, and infrastructure.";
  existing.about = p.about || "Dedicated Civil Engineer specializing in site execution, quality assurance, and infrastructure delivery. Over 5 years of seasoned experience in budgeting, contractor liaisoning, and construction safety compliance.";
  existing.description = existing.about;
  existing.email = p.contact?.email || "amiteshpandey2014@gmail.com";
  existing.phone = p.contact?.phone || "9838385129";
  existing.github = "";
  existing.linkedin = "";
  existing.website = "";

  existing.hero = {
    name: "Amitesh Pandey",
    title: "Civil Engineer",
    avatar: p.hero?.avatar || existing.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=Amitesh%20Pandey&backgroundColor=6366f1,8b5cf6,ec4899&textColor=ffffff`,
    tagline: existing.tagline,
  };
  existing.avatar = existing.hero.avatar;

  existing.skills = Array.from(new Set(cleanedSkills));
  existing.projects = p.projects || [];
  existing.experience = p.experience || [];
  existing.education = p.education || [];

  existing.seo = {
    title: "Amitesh Pandey — Civil Engineer Portfolio",
    description: existing.about,
    keywords: ["Civil Engineer", "Construction Management", "Site Engineering", "AutoCAD", "BOQ", "Infrastructure"],
  };

  await existing.save();
  console.log("\n✅ Successfully updated portfolio in MongoDB!");
  console.log("Updated Title:", existing.title);
  console.log("Updated Role:", existing.hero?.title);
  console.log("Updated Projects:", existing.projects.map(pr => pr.title));
  console.log("Updated Experience:", existing.experience.map(e => `${e.role} at ${e.company} (${e.duration})`));
  console.log("Updated Education:", existing.education.map(ed => `${ed.institution} (${ed.degree})`));
  console.log("Updated Skills:", existing.skills);

  await mongoose.disconnect();
}

updateAmitesh().catch((err) => {
  console.error("Error updating portfolio:", err);
  process.exit(1);
});
