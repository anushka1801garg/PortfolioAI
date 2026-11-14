import Resume from "../models/resume.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// Upload Resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "PortfolioAI/Resumes",
    });

    // Delete local temporary file after upload
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (e) {}

    const resume = await Resume.create({
      title: req.file.originalname,
      resumeUrl: result.secure_url,
      publicId: result.public_id,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    console.error("[uploadResume error]", error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Resumes
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Resume
export const deleteResume = async (req, res) => {
  try {
    // Enforce ownership: only delete resume belonging to the authenticated user
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found or unauthorized",
      });
    }

    if (resume.publicId) {
      try {
        const destroyRes = await cloudinary.uploader.destroy(resume.publicId, {
          resource_type: "raw",
        });
        if (destroyRes?.result === "not found") {
          await cloudinary.uploader.destroy(resume.publicId, {
            resource_type: "image",
          });
        }
      } catch (cloudErr) {
        console.warn("[deleteResume] Cloudinary destroy soft error:", cloudErr.message);
      }
    }

    await Resume.findByIdAndDelete(resume._id);

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
