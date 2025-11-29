const express = require("express");
const router = express.Router();
const { callGroq, matchResumePDF } = require("../controller/aiController");

// Generate Job Description
router.post("/generate-jobdesc", async (req, res) => {
  const { role, skills, experience, perks } = req.body;
  if (!role) return res.status(400).json({ message: "Role is required" });

  const prompt = `Create a detailed job description for a ${role} role.
Required skills: ${skills || "not specified"}.
Experience: ${experience || "not specified"}.
Benefits: ${perks || "not specified"}.`;

  try {
    const result = await callGroq(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Summarize Job Description
router.post("/summarize-jobdesc", async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription)
    return res.status(400).json({ message: "Job description required" });

  const prompt = `Summarize the following job description in 3-4 bullet points: ${jobDescription}`;
  try {
    const result = await callGroq(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Interview Questions
router.post("/interview-questions", async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription)
    return res.status(400).json({ message: "Job description required" });

  const prompt = `Based on this job description, generate 5 common interview questions for this role: ${jobDescription}`;
  try {
    const result = await callGroq(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Salary Guidance
router.post("/salary-guidance", async (req, res) => {
  const { role, experience, companyType, city } = req.body;
  if (!role || !experience || !companyType || !city)
    return res.status(400).json({ message: "All fields are required" });

  const prompt = `
  You are an HR AI assistant.
  Provide a realistic salary estimate for:
  Role: ${role}
  Experience: ${experience}
  Company Type: ${companyType}
  City: ${city}

  Give the salary in INR with a reasonable range and a short note explaining why.`;
  try {
    const result = await callGroq(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resume Match
router.post("/resume-match", matchResumePDF);

module.exports = router;
