import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[\x20-\x7E]{8,}$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (v) {
          if (!v) return false;
          // Bypass regex if already bcrypt hashed
          if (v.startsWith("$2a$") || v.startsWith("$2b$")) return true;
          return PASSWORD_REGEX.test(v);
        },
        message: "Password must be at least 8 characters long and contain at least one letter and one number",
      },
    },

    passwordChangedAt: {
      type: Date,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "user",
    },

    plan: {
      type: String,
      enum: ["free", "pro", "team"],
      default: "free",
    },

    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^(?:\+91[\-\s]?)?[6789]\d{9}$/.test(v);
        },
        message: "Invalid Indian phone number format. Must be a valid 10-digit mobile number.",
      },
    },

    github: {
      type: String,
      default: "",
      trim: true,
    },

    githubAccessToken: {
      type: String,
      default: "",
      select: false,
    },

    githubUsername: {
      type: String,
      default: "",
    },


    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    experienceLevel: {
      type: String,
      default: "Mid-level",
    },

    subscriptionDate: {
      type: Date,
      default: null,
    },

    paymentHistory: [
      {
        orderId: { type: String, default: "" },
        plan: String,
        amount: Number,
        currency: { type: String, default: "INR" },
        paymentMethod: String,
        transactionId: String,
        status: { type: String, default: "completed" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.githubAccessToken;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.githubAccessToken;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

  // If modifying password on an existing user, record timestamp 1s in past so immediately issued tokens are valid
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Returns true if token was issued prior to the most recent password change or lacks a valid iat claim
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    if (typeof JWTTimestamp !== "number" || !Number.isFinite(JWTTimestamp)) {
      return true;
    }
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

export default mongoose.model("User", userSchema);
