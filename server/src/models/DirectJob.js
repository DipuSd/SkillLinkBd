const mongoose = require("mongoose");

const directJobSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    preferredDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["requested", "in-progress", "completed", "declined", "cancelled"],
      default: "requested",
      index: true,
    },
    completedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentAmount: {
      type: Number,
      min: 0,
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

directJobSchema.index({ client: 1, status: 1 });
directJobSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model("DirectJob", directJobSchema);

