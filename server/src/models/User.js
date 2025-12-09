const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Model Schema
 * 
 * Represents all users in the system (clients, providers, and admins).
 * Stores user authentication, profile information, and statistics.
 */
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include password in query results by default
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      default: "client",
      index: true,
    },
    
    // Location Information
    location: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    
    // Profile Information (mainly for providers)
    skills: {
      type: [String],
      default: [],
    },
    avatarUrl: {
      type: String,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    
    // Rating and Statistics
    rating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    postedJobs: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    
    // Account Status
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: {
      // Transform the document when converting to JSON
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        delete ret.__v;
        delete ret.password; // Never expose password in JSON
        return ret;
      },
    },
  }
);

// Database Indexes for optimized queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ skills: 1 });

/**
 * Pre-save Hook: Hash Password
 * 
 * Automatically hashes the password before saving to database.
 * Only runs if password field is modified.
 */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance Method: Match Password
 * 
 * Compares a candidate password with the stored hashed password.
 * 
 * @param {string} candidate - The password to check
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.matchPassword = async function matchPassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
