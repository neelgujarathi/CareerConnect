const express = require("express");
const router = express.Router();
require("dotenv").config();
const Groq = require("groq-sdk");

// ✅ Initialize Groq client safely
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Salary Guidance Route
router.post("/salary-guidance", async (req, res) => {
  try {
    const { role, experience, companyType, city } = req.body;

    if (!role || !experience || !companyType || !city) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 🧠 Build prompt
    const prompt = `
    You are an HR AI assistant.
    Provide a realistic salary estimate for:
    - Role: ${role}
    - Experience: ${experience}
    - Company Type: ${companyType}
    - City: ${city}

    Return result in this format:
    Salary Range: ₹X–₹Y LPA
    Reason: (1–2 lines short explanation)
    `;

    // 🧠 Call Groq API
    const completion = await client.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices?.[0]?.message?.content || "No response";

    return res.json({ result });
  } catch (err) {
    console.error("💥 Salary Guidance Error:", err.response?.data || err.message || err);
    return res.status(500).json({ message: "Error generating salary guidance" });
  }
});

module.exports = router;
