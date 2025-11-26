const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Application = require("../models/application.model");
const extractSkillsFromResume = require("../util/extractSkills");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ---------------- Cloudinary Storage ----------------
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    resource_type: "raw", 
  },
});
const parser = multer({ storage });

// ---------------- APPLY FOR JOB ----------------
router.post("/apply", parser.single("resume"), async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId || !req.file) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

   
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

  
    const tempFilePath = path.join(tempDir, req.file.originalname);
    const response = await axios.get(req.file.path, { responseType: "arraybuffer" });
    fs.writeFileSync(tempFilePath, response.data);

  
    const extractedSkills = await extractSkillsFromResume(tempFilePath);

    const newApp = await Application.create({
      userId,
      jobId,
      resumeUrl: req.file.path,
      resumePublicId: req.file.filename,
      skills: extractedSkills,
      status: "Pending",
    });

    fs.unlinkSync(tempFilePath);

    res.status(201).json({ success: true, data: newApp });
  } catch (err) {
    console.error("❌ Error applying for job:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
