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

    // Validate required fields
    if (!role || !experience || !companyType || !city) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Prompt for AI
    const prompt = `
    You are an HR AI assistant.
    Provide a realistic salary estimate for a candidate:
    - Role: ${role}
    - Experience: ${experience}
    - Company Type: ${companyType}
    - City: ${city}

    Respond with:
    1. A salary range in INR (e.g., ₹6–10 LPA)
    2. A short explanation for this estimate
    Format it neatly and clearly.
    `;

    // 🧠 Call Groq API (LLaMA 3)
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    // ✅ Extract AI response
    const result = completion.choices?.[0]?.message?.content || "No response received";

    return res.json({ result });
  } catch (err) {
    console.error("💥 Salary Guidance Error:", err.response?.data || err.message || err);
    return res.status(500).json({ message: "Error generating salary guidance" });
  }
});

module.exports = router;
