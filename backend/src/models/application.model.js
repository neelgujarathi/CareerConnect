const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  resumeUrl: String,
  resumePublicId: String,
  skills: {
    type: [String],       
    default: [],
  },
  status: {
    type: String,
    enum: ["Pending", "Selected", "Rejected", "Call for Interview"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Application", applicationSchema);
