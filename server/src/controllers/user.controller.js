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

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }
    if (jobTitle !== undefined) {
      user.jobTitle = jobTitle.trim();
    }
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (location !== undefined) {
      user.location = location.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    if (github !== undefined) {
      user.github = github.trim();
    }
    if (linkedin !== undefined) {
      user.linkedin = linkedin.trim();
    }
    if (website !== undefined) {
      user.website = website.trim();
    }
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (experienceLevel !== undefined) {
      user.experienceLevel = experienceLevel;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
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

    // In production, require checkout verification through Stripe unless demo payments are explicitly allowed
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_DEMO_PAYMENTS !== "true" &&
      normalizedPlan !== "free"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Direct subscription updates are disabled in production. Please complete checkout through Stripe.",
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

