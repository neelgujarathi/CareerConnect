const express = require("express");
const router = express.Router();
require("dotenv").config();
const Groq = require("groq-sdk");

// ✅ Initialize Groq client
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Salary Guidance Route
router.post("/salary-guidance", async (req, res) => {
  try {
    const { role, experience, companyType, city } = req.body;

    if (!role || !experience || !companyType || !city) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Build prompt
    const prompt = `
    You are an experienced HR AI assistant.
    Provide a realistic salary estimate for a candidate based on the details below:

    Role: ${role}
    Experience: ${experience}
    Company Type: ${companyType}
    City: ${city}

    Task:
    1. Provide a salary range in INR (e.g., ₹6–10 LPA)
    2. Write a short explanation of why this range is fair.
    3. Format it neatly and professionally for the user.
    `;

    // Call Groq API (LLaMA 3)
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192", // best free model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;

    res.json({ result });
  } catch (err) {
    console.error("💥 Salary Guidance Error:", err);
    res.status(500).json({ message: "Error generating salary guidance" });
  }
});

module.exports = router;
