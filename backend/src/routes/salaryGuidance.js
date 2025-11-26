const express = require("express");
const router = express.Router();
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  apiVersion: "v1alpha" 
});

router.post("/salary-guidance", async (req, res) => {
  try {
    const { role, experience, companyType, city } = req.body;

    if (!role || !experience || !companyType || !city) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const prompt = `
      You are an HR AI assistant.
      Provide a realistic salary estimate for a candidate based on the following information:
      Role: ${role}
      Experience: ${experience}
      Company Type: ${companyType}
      City: ${city}

      Give the salary in INR, a reasonable range, and a short note explaining why this is a fair estimate.
      Format it in a clear, professional way for display to the user.
    `;

    const response = await ai.text.generate({
      model: "models/text-bison-001",
      prompt: prompt,
      temperature: 0.7,
      maxOutputTokens: 500
    });

    const result = response.candidates[0].content;

    res.json({ result });

  } catch (err) {
    console.error("Salary Guidance Error:", err);
    res.status(500).json({ message: "Error generating salary guidance" });
  }
});

module.exports = router;
