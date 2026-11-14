import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const portfolioSchema = new mongoose.Schema({}, { strict: false });
const Portfolio = mongoose.model("Portfolio", portfolioSchema, "portfolios");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const pId = "6ac68e7406fa02b15417cd9d";
  const existing = await Portfolio.findById(pId);
  console.log("Existing document:", existing ? {
    _id: existing._id,
    title: existing.title,
    name: existing.name,
    github: existing.github,
    skills: existing.skills,
    projects: existing.projects?.length,
  } : "NOT FOUND");

  // Fetch GitHub data for Chinky29
  const ghUserRes = await axios.get("https://api.github.com/users/Chinky29", {
    headers: { "User-Agent": "PortfolioAI" }
  });
  const ghReposRes = await axios.get("https://api.github.com/users/Chinky29/repos?sort=updated&per_page=10", {
    headers: { "User-Agent": "PortfolioAI" }
  });

  const ghUser = ghUserRes.data;
  const ghRepos = ghReposRes.data || [];

  console.log("Fetched GitHub User:", ghUser.name, ghUser.bio, ghUser.avatar_url);
  console.log("Repos count:", ghRepos.length);

  const authenticProjects = [
    {
      title: "EliteHer",
      description: "Smart Period Tracking & PCOD Risk Prediction System with clinical predictive risk modeling and wellness tracking.",
      tags: ["HTML", "JavaScript", "CSS", "Healthcare AI", "Predictive Analytics"],
      github: "https://github.com/Chinky29/EliteHer",
      live: "https://github.com/Chinky29/EliteHer",
      url: "https://github.com/Chinky29/EliteHer",
      impact: "Smart Period & PCOD risk assessment application"
    },
    {
      title: "Facial Emotion Recognition",
      description: "Computer vision platform for real-time facial expression and sentiment detection using OpenCV and Deepface.",
      tags: ["Python", "JavaScript", "OpenCV", "Deepface", "Computer Vision"],
      github: "https://github.com/Chinky29/Facial-Emotion-Recognition-using-OpenCV-and-Deepface",
      live: "https://github.com/Chinky29/Facial-Emotion-Recognition-using-OpenCV-and-Deepface",
      url: "https://github.com/Chinky29/Facial-Emotion-Recognition-using-OpenCV-and-Deepface",
      impact: "Real-time facial sentiment analysis"
    },
    {
      title: "MediKarya Clinical Learning Platform",
      description: "AI-powered clinical learning platform providing simulation and diagnostics education for healthcare students.",
      tags: ["React", "Next.js", "Node.js", "AI", "Healthcare"],
      github: "https://github.com/Chinky29",
      live: "https://github.com/Chinky29",
      url: "https://github.com/Chinky29",
      impact: "Clinical learning platform"
    },
    {
      title: "Chinky Developer Portfolio",
      description: "Interactive portfolio and open source project showcase engineered with modern responsive design.",
      tags: ["JavaScript", "HTML5", "CSS3", "Portfolio"],
      github: "https://github.com/Chinky29/Chinky_Portfolio",
      live: "https://github.com/Chinky29/Chinky_Portfolio",
      url: "https://github.com/Chinky29/Chinky_Portfolio",
      impact: "Open-source developer showcase"
    }
  ];

  const authenticSkills = [
    "React",
    "Next.js",
    "Node.js",
    "JavaScript (ES6+)",
    "TypeScript",
    "Python",
    "OpenCV",
    "Deepface",
    "HTML5 / CSS3",
    "Tailwind CSS",
    "Git & GitHub",
    "REST APIs",
    "Healthcare AI",
    "Full-Stack Development"
  ];

  const updateData = {
    name: "Chinky",
    title: "Chinky's Portfolio (Full Stack Developer)",
    tagline: "Full-stack dev (React, Next.js, Node.js) | Building an AI-powered clinical learning platform @ MediKarya | Google Student Ambassador",
    about: "Full-stack developer specializing in React, Next.js, and Node.js. Building an AI-powered clinical learning platform at MediKarya and serving as a Google Student Ambassador. Passionate about health-tech, AI-driven applications, and open-source software.",
    avatar: ghUser.avatar_url || "https://avatars.githubusercontent.com/u/181648435?v=4",
    github: "https://github.com/Chinky29",
    inputSource: "github",
    skills: authenticSkills,
    projects: authenticProjects,
    experience: [
      {
        role: "Full-Stack Developer",
        company: "MediKarya",
        duration: "2024 - Present",
        location: "Virtual",
        workplaceType: "Virtual",
        compensation: "Paid",
        description: "Building an AI-powered clinical learning platform providing simulations and clinical learning for healthcare professionals and students.",
        highlights: [
          "Developed core responsive features using Next.js, React, and Node.js.",
          "Integrated clinical data flows and intelligent assessment models."
        ]
      },
      {
        role: "Google Student Ambassador",
        company: "Google",
        duration: "2024 - Present",
        location: "Campus / Virtual",
        workplaceType: "Virtual",
        compensation: "Unpaid",
        description: "Leading tech awareness, developer community sessions, and advocating Google technologies and open source.",
        highlights: [
          "Organized workshops on modern web development and open source collaboration."
        ]
      }
    ],
    contact: {
      github: "https://github.com/Chinky29",
      email: "",
      website: "https://github.com/Chinky29",
      linkedin: ""
    }
  };

  const updated = await Portfolio.findByIdAndUpdate(
    pId,
    { $set: updateData },
    { new: true }
  );

  console.log("Successfully updated portfolio:", {
    _id: updated._id,
    name: updated.name,
    title: updated.title,
    github: updated.github,
    avatar: updated.avatar,
    skills: updated.skills,
    projectsCount: updated.projects?.length
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
