import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    tagline: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    template: {
      type: String,
      default: "modern",
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    customHtml: {
      type: String,
      default: "",
    },

    sourceUrl: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    resumeName: {
      type: String,
      default: "",
    },

    skills: [
      {
        type: String,
      },
    ],

    projects: [
      {
        title: String,
        description: String,
        tags: [String],
        github: String,
        live: String,
        url: String,
        link: String,
        impact: String,
      },
    ],

    experience: [
      {
        role: String,
        company: String,
        duration: String,
        location: String,
        workplaceType: String,
        compensation: String,
        compensationAmount: String,
        projectTitle: String,
        projectLive: String,
        projectGithub: String,
        description: String,
        highlights: [String],
        offerLetter: String,
        offerLetterName: String,
        certificate: String,
        certificateName: String,
      },
    ],

    education: [
      {
        institution: String,
        degree: String,
        year: String,
        description: String,
      },
    ],

    achievements: [
      {
        title: String,
        description: String,
        date: String,
        metric: String,
        link: String,
        url: String,
      },
    ],

    certifications: [
      {
        name: String,
        issuer: String,
        date: String,
        description: String,
        link: String,
        url: String,
      },
    ],

    blog: [
      {
        title: String,
        excerpt: String,
        readTime: String,
        link: String,
        date: String,
      },
    ],

    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: "" },
    },

    preferences: {
      colorScheme: { type: String, default: "indigo" },
      primaryColor: { type: String, default: "#6366f1" },
      style: { type: String, default: "modern" },
      font: { type: String, default: "Inter" },
      animationSpeed: { type: String, default: "smooth" },
      interactive: {
        soundEffects: { type: Boolean, default: true },
        enableFilter: { type: Boolean, default: true },
        enableTerminal: { type: Boolean, default: true },
        enableAiCopilot: { type: Boolean, default: true },
        themeMood: { type: String, default: "indigo" },
      },
      customDesign: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      customLayout: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      customPitch: {
        type: String,
        default: "",
      },
      customCta: {
        type: String,
        default: "",
      },
    },

    targetRole: {
      type: String,
      default: "",
    },

    targetCompany: {
      type: String,
      default: "",
    },

    creationType: {
      type: String,
      enum: ["template", "custom"],
      default: "template",
    },

    inputSource: {
      type: String,
      default: "form",
    },

    deployedUrl: {
      type: String,
      default: "",
    },

    deploymentPlatform: {
      type: String,
      default: "",
    },

    customDomain: {
      type: String,
      default: "",
    },

    githubRepoUrl: {
      type: String,
      default: "",
    },

    deploymentStatus: {
      type: String,
      enum: ["Idle", "Building", "Live", "Failed"],
      default: "Idle",
    },

    deployedAt: {
      type: Date,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    analysisReport: {
      overallScore: Number,
      categories: mongoose.Schema.Types.Mixed,
      strengths: [String],
      weaknesses: [String],
      suggestions: [mongoose.Schema.Types.Mixed],
      contentSuggestions: [mongoose.Schema.Types.Mixed],
      themeRecommendation: mongoose.Schema.Types.Mixed,
      missingKeywords: [String],
      targetRole: String,
      targetCompany: String,
      sourceUrl: String,
      rawHtml: String,
      analyzedAt: Date,
    },

    versions: [
      {
        versionNumber: { type: Number, default: 1 },
        name: { type: String, default: "Initial Version" },
        snapshot: mongoose.Schema.Types.Mixed,
        changedBy: { type: String, default: "User" },
        changeSummary: { type: String, default: "Initial portfolio creation" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

portfolioSchema.index({ user: 1, updatedAt: -1 });
portfolioSchema.index({ user: 1, isArchived: 1, updatedAt: -1 });
portfolioSchema.index({ customDomain: 1 }, { unique: true, sparse: true });
portfolioSchema.index({ deployedUrl: 1 }, { sparse: true });
portfolioSchema.index({ isArchived: 1 });
portfolioSchema.index({ isPublic: 1, status: 1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
