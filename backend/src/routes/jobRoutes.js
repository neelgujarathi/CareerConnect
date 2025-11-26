const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Job = require("../models/postjob");

router.post("/jobs", async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiterId: new mongoose.Types.ObjectId(req.body.recruiterId),
    };

    const job = await Job.create(jobData);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error("❌ Error creating job:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/jobs/search", async (req, res) => {
  try {
    const { query = "", location = "" } = req.query;
    const searchConditions = {
      $and: [
        query
          ? {
              $or: [
                { jobname: { $regex: query, $options: "i" } },
                { companyname: { $regex: query, $options: "i" } },
                { jobtype: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
              ],
            }
          : {},
        location
          ? { location: { $regex: location, $options: "i" } }
          : {},
      ],
    };
    const jobs = await Job.find(searchConditions).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error searching jobs:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Job
router.delete("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { recruiterId } = req.query;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.recruiterId.toString() !== recruiterId)
      return res.status(403).json({ message: "Not authorized" });

    await Job.findByIdAndDelete(jobId);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting job" });
  }
});

// Update Job
router.put("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { recruiterId, jobname, companyname, jobtype, location, salary } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.recruiterId.toString() !== recruiterId)
      return res.status(403).json({ message: "Not authorized" });

    job.jobname = jobname || job.jobname;
    job.companyname = companyname || job.companyname;
    job.jobtype = jobtype || job.jobtype;
    job.location = location || job.location;
    job.salary = salary || job.salary;

    await job.save();
    res.json({ message: "Job updated successfully", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating job" });
  }
});

module.exports = router;
