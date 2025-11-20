const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
    },
    proposedBudget: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "hired",
        "completed",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
      index: true,
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

applicationSchema.index({ job: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
