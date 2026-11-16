import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import bcrypt from "bcrypt";

// Get Logged-in User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Profile
export const updateUserProfile = async (req, res) => {
  try {
    const {
      fullName,
      jobTitle,
      bio,
      location,
      phone,
      github,
      linkedin,
      website,
      skills,
      experienceLevel,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (typeof fullName === "string") {
      user.fullName = fullName.trim();
    }
    if (typeof jobTitle === "string") {
      user.jobTitle = jobTitle.trim();
    }
    if (typeof bio === "string") {
      user.bio = bio;
    }
    if (typeof location === "string") {
      user.location = location.trim();
    }
    if (typeof phone === "string") {
      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        const INDIAN_PHONE_REGEX = /^(?:\+91[\-\s]?)?[6789]\d{9}$/;
        if (!INDIAN_PHONE_REGEX.test(trimmedPhone)) {
          return res.status(400).json({
            success: false,
            message: "Invalid phone number format. Please provide a valid 10-digit Indian mobile number (e.g. +91 98765 43210 or 9876543210).",
          });
        }
        user.phone = trimmedPhone;
      } else {
        user.phone = "";
      }
    }
    if (typeof github === "string") {
      user.github = github.trim();
    }
    if (typeof linkedin === "string") {
      user.linkedin = linkedin.trim();
    }
    if (typeof website === "string") {
      user.website = website.trim();
    }
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills.filter((s) => typeof s === "string").map((s) => s.trim()).filter(Boolean)
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : user.skills;
    }
    if (typeof experienceLevel === "string") {
      user.experienceLevel = experienceLevel.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }

      if (
        typeof newPassword !== "string" ||
        newPassword.length < 8 ||
        !/^(?=.*[A-Za-z])(?=.*\d)[\x20-\x7E]{8,}$/.test(newPassword)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 8 characters long and contain at least one letter and one number",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = newPassword;
      user.passwordChangedAt = new Date(Date.now() - 1000);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload.",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "PortfolioAI/Avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
      ],
    });

    // Delete local temporary file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Update user avatar in database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: result.secure_url,
      user,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload avatar",
    });
  }
};

// Update Plan / Subscription
export const updateSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod, transactionId, amount } = req.body;

    const normalizedPlan = (plan || "pro").toLowerCase();
    if (!["free", "pro", "team"].includes(normalizedPlan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan.",
      });
    }

    // In production, require checkout verification through Razorpay unless demo payments are explicitly allowed
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_DEMO_PAYMENTS !== "true" &&
      normalizedPlan !== "free"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Direct subscription updates are disabled in production. Please complete checkout through Razorpay.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.plan = normalizedPlan;
    user.subscriptionDate = new Date();

    if (normalizedPlan !== "free") {
      if (!user.paymentHistory) user.paymentHistory = [];
      user.paymentHistory.push({
        plan: normalizedPlan,
        amount: amount || (normalizedPlan === "pro" ? 499 : 999),
        currency: "INR",
        paymentMethod: paymentMethod || "card",
        transactionId: transactionId || `TXN_${Date.now()}`,
        status: "completed",
        date: new Date(),
      });
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: `Plan upgraded to ${normalizedPlan.toUpperCase()} successfully!`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Subscription update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscription.",
    });
  }
};

