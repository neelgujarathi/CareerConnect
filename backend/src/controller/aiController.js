const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractJSON(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("JSON parse fallback triggered:", err);
    return null;
  }
}

const matchResumePDF = [
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const file = req.file;

      if (!jobDescription || !file)
        return res
          .status(400)
          .json({ message: "Job description & resume required" });

      // 🔹 Extract resume text
      const pdfData = await pdfParse(file.buffer);
      const resumeText = pdfData.text;

      // 🔹 Build prompt
      const prompt = `
      You are a professional career AI assistant.

      Job Description:
      ${jobDescription}

      Candidate Resume:
      ${resumeText}

      Task:
      1. List the skills the candidate already has that match the job description.
      2. List missing skills required for the job.
      3. Suggest 5 concise improvements (1 line each) to make the resume closer to the job description.
      4. Calculate match percentage based ONLY on skills (ignore experience years, location, soft skills).

      Output STRICTLY as JSON:
      {
        "matchedSkills": [],
        "missingSkills": [],
        "suggestions": [],
        "percentageMatch": number
      }
      No extra explanation, no markdown, no text outside JSON.
      `;

      // 🔹 Call Gemini correctly
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // 🔹 Parse JSON safely
      let resultJSON = extractJSON(responseText);
      if (!resultJSON) {
        resultJSON = {
          matchedSkills: [],
          missingSkills: [],
          suggestions: [responseText || "No suggestions available"],
          percentageMatch: 0,
        };
      }

      // 🔹 Send response
      res.json({
        matchedSkills: resultJSON.matchedSkills || [],
        missingSkills: resultJSON.missingSkills || [],
        suggestions: resultJSON.suggestions || [],
        percentageMatch: resultJSON.percentageMatch || 0,
      });
    } catch (err) {
      console.error("Resume match error:", err);
      res.status(500).json({ message: "Error processing resume PDF" });
    }
  },
];

module.exports = { matchResumePDF };
