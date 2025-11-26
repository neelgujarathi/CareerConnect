const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const router = express.Router();
const { matchResumePDF } = require("../controller/aiController");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  apiVersion: "v1alpha" 
});

const callGemini = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response?.text || "No result from Gemini API";
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    throw new Error("Error calling Gemini API");
  }
};

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

// Summarize Job Description
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

// Generate Interview Questions
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

// Generate Salary Guidance
router.post("/salary-guidance", async (req, res) => {
  const { role, experience, companyType, city } = req.body;

  if (!role || !experience || !companyType || !city) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const prompt = `
    You are an HR AI assistant.
    Provide a realistic salary estimate for a candidate based on the following:
    Role: ${role}
    Experience: ${experience}
    Company Type: ${companyType}
    City: ${city}
    
    Give the salary in INR, a reasonable range, and a short note explaining why this is a fair estimate.
    Format it in a clear, professional way for display to the user.
  `;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/resume-match", matchResumePDF);

module.exports = router;
