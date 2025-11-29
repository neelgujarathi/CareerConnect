const Groq = require("groq-sdk");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Helper: Call Groq safely
async function callGroq(prompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("Error calling Groq:", err.response?.data || err.message || err);
    throw new Error("Groq API request failed");
  }
}

// 🔹 Helper: Parse JSON safely
function extractJSON(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// 🔹 Resume Match Route
const matchResumePDF = [
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const file = req.file;

      if (!jobDescription || !file)
        return res.status(400).json({ message: "Job description & resume required" });

      const pdfData = await pdfParse(file.buffer);
      const resumeText = pdfData.text;

      const prompt = `
      You are a professional career AI assistant.

      Job Description:
      ${jobDescription}

      Candidate Resume:
      ${resumeText}

      Task:
      1. List matched skills.
      2. List missing skills.
      3. Suggest 5 improvements.
      4. Give a skill match percentage.
      Output as strict JSON:
      {
        "matchedSkills": [],
        "missingSkills": [],
        "suggestions": [],
        "percentageMatch": number
      }
      `;

      const responseText = await callGroq(prompt);
      let resultJSON = extractJSON(responseText) || {
        matchedSkills: [],
        missingSkills: [],
        suggestions: [responseText],
        percentageMatch: 0,
      };

      res.json(resultJSON);
    } catch (err) {
      console.error("Resume match error:", err);
      res.status(500).json({ message: "Error processing resume PDF" });
    }
  },
];

module.exports = { callGroq, matchResumePDF };
