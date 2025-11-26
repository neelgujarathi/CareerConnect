const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Job = require("../models/postjob");
const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");

// -------------------- JOBSEEKER DASHBOARD --------------------
router.get("/dashboard/jobseeker", async (req, res) => {
  const { userId } = req.query;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid or missing userId" });
  }

  try {
    const applications = await Application.find({ userId })
      .populate({
        path: "jobId",
        model: "Job",
        populate: {
          path: "recruiterId",
          model: "User",
          select: "_id name email",
        },
      });

    const jobs = applications.map((app) => ({
      _id: app.jobId?._id || null,
      jobname: app.jobId?.jobname || "N/A",
      companyname: app.jobId?.companyname || "N/A",
      jobtype: app.jobId?.jobtype || "N/A",
      location: app.jobId?.location || "N/A",
      salary: app.jobId?.salary || "N/A",
      recruiterId: app.jobId?.recruiterId?._id || null,
      recruiterName: app.jobId?.recruiterId?.name || "Unknown",
      recruiterEmail: app.jobId?.recruiterId?.email || "N/A",
      resumeUrl: app.resumeUrl || null,
      status: app.status || "Pending", 
    }));

    res.json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobseeker dashboard:", err);
    res.status(500).json({ message: err.message });
  }
});


// -------------------- RECRUITER DASHBOARD --------------------
router.get("/dashboard/recruiter", async (req, res) => {
  const { recruiterId } = req.query;

  if (!recruiterId || !mongoose.Types.ObjectId.isValid(recruiterId)) {
    return res.status(400).json({ message: "Invalid or missing recruiterId" });
  }

  try {
    const jobs = await Job.find({ recruiterId });

    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ jobId: job._id }).populate("userId");

        const formattedApps = applications.map((app) => ({
          _id: app._id, // include app id for update
          applicantId: app.userId?._id || null,
          applicantName: app.userId?.name || "Unknown",
          resumeUrl: app.resumeUrl || null,
          status: app.status || "Pending",
        }));

        return {
          _id: job._id,
          jobname: job.jobname,
          companyname: job.companyname,
          jobtype: job.jobtype,
          location: job.location,
          salary: job.salary,
          recruiterId: job.recruiterId?._id || job.recruiterId || null,
          applications: formattedApps,
        };
      })
    );

    res.json(jobsWithApplications);
  } catch (err) {
    console.error("❌ Error fetching recruiter dashboard:", err);
    res.status(500).json({ message: err.message });
  }
});

// -------------------- UPDATE APPLICATION STATUS --------------------
router.put("/application/status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ["Pending", "Selected", "Rejected", "Call for Interview"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedApp = await Application.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedApp) return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Status updated successfully", application: updatedApp });
  } catch (err) {
    console.error("❌ Error updating application status:", err);
    res.status(500).json({ message: err.message });
  }
});

// -------------------- RECRUITER ANALYTICS --------------------
router.get("/dashboard/recruiter/analytics", async (req, res) => {
  const { recruiterId } = req.query;

  if (!recruiterId || !mongoose.Types.ObjectId.isValid(recruiterId)) {
    return res.status(400).json({ message: "Invalid or missing recruiterId" });
  }

  try {
    // Fetch all jobs by recruiter
    const jobs = await Job.find({ recruiterId });

    const analyticsData = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ jobId: job._id }).populate("userId");

        const skillCountMap = {};
        const requiredSkills = job.requiredSkills || [];

        const applicationsWithMissingSkills = applications.map((app) => {
          const applicantSkills = app.skills || [];
          const missingSkills = requiredSkills.filter(
            (skill) =>
              skill.trim().length > 0 &&
              !applicantSkills.some(
                (aSkill) =>
                  aSkill.toLowerCase().trim() === skill.toLowerCase().trim()
              )
          );

          missingSkills.forEach((skill) => {
            skillCountMap[skill] = (skillCountMap[skill] || 0) + 1;
          });

          return {
            applicantId: app.userId?._id || null,
            applicantName: app.userId?.name || "Unknown",
            missingSkills,
          };
        });

        const skillGaps =
          Object.keys(skillCountMap).length > 0
            ? Object.keys(skillCountMap).map((skill) => ({
                skill,
                count: skillCountMap[skill],
              }))
            : [];

        return {
          jobId: job._id,
          jobname: job.jobname,
          totalApplications: applications.length,
          applications: applicationsWithMissingSkills,
          skillGaps,
        };
      })
    );

    res.json(analyticsData);
  } catch (err) {
    console.error("❌ Error fetching recruiter analytics:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
