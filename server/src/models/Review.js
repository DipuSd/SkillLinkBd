const mongoose = require("mongoose");

/**
 * Review Model Schema
 * 
 * Represents reviews/ratings given after job completion.
 * Clients can review providers and vice versa.
 */
const reviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewerRole: {
      type: String,
      enum: ["client", "provider"],
      default: "client",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Database indexes for queries
reviewSchema.index({ provider: 1, createdAt: -1, reviewerRole: 1 });
reviewSchema.index({ job: 1, reviewerRole: 1 }, { unique: true }); // One review per role per job

module.exports = mongoose.model("Review", reviewSchema);
