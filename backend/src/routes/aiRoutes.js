const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();
const { matchResumePDF } = require("../controller/aiController");

// ✅ Initialize Gemini client (new SDK)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const callGemini = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // ✅ stable
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Error calling Gemini API:", err.response?.data || err.message || err);
    throw new Error("Gemini API request failed");
  }
};

// ======================= ROUTES =======================

// 🔹 Generate Job Description
router.post("/generate-jobdesc", async (req, res) => {
  const { role, skills, experience, perks } = req.body;
  if (!role) return res.status(400).json({ message: "Role is required" });

  const prompt = `Create a detailed job description for a ${role} role.
Required skills: ${skills || "not specified"}.
Experience: ${experience || "not specified"}.
Benefits: ${perks || "not specified"}.`;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Summarize Job Description
router.post("/summarize-jobdesc", async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) return res.status(400).json({ message: "Job description required" });

  const prompt = `Summarize the following job description in 3-4 bullet points: ${jobDescription}`;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Generate Interview Questions
router.post("/interview-questions", async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) return res.status(400).json({ message: "Job description required" });

  const prompt = `Based on this job description, generate 5 common interview questions for this role: ${jobDescription}`;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Generate Salary Guidance
router.post("/salary-guidance", async (req, res) => {
  const { role, experience, companyType, city } = req.body;

  if (!role || !experience || !companyType || !city) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const prompt = `
    You are an HR AI assistant.
    Provide a realistic salary estimate for a candidate based on:
    Role: ${role}
    Experience: ${experience}
    Company Type: ${companyType}
    City: ${city}
    
    Give the salary in INR, a reasonable range, and a short note explaining why this is a fair estimate.
    Format it neatly and professionally.
  `;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Resume Match
router.post("/resume-match", matchResumePDF);

module.exports = router;
