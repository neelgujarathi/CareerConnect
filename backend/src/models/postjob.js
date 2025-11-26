const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobname: { type: String, required: true },
    companyname: { type: String, required: true },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobtype: { type: String, required: true },
    location: String,
    salary: String,
    description: String,
     requiredSkills: {
    type: [String],    
    default: [],
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
