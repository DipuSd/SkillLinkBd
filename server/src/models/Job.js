const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    requiredSkill: {
      type: String,
      required: true,
      index: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
      index: true,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
    hiredApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
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

jobSchema.index({ client: 1, status: 1 });
jobSchema.index({ assignedProvider: 1, status: 1 });
jobSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Job", jobSchema);
