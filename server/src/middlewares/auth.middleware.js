import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session expired. Please log in again.",
      });
    }

    // Revoke sessions issued prior to the most recent password reset/change
    if (
      user.passwordChangedAt &&
      (typeof decoded.iat !== "number" || !Number.isFinite(decoded.iat))
    ) {
      return res.status(401).json({
        success: false,
        message: "Password was recently changed. Please log in again with your new password.",
        passwordChanged: true,
      });
    }

    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Password was recently changed. Please log in again with your new password.",
        passwordChanged: true,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired after 1 day. Please log in again to continue.",
        expired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};
