const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Initialize Groq client
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper function to call Groq (LLaMA 3)
async function callGroq(prompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192", // best free model
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Error calling Groq API:", err);
    throw new Error("Groq API request failed");
  }
}

// Helper for parsing JSON safely
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

// -------------------- Resume Match --------------------
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

      const pdfData = await pdfParse(file.buffer);
      const resumeText = pdfData.text;

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
      `;

      const responseText = await callGroq(prompt);
      let resultJSON = extractJSON(responseText);

      if (!resultJSON) {
        resultJSON = {
          matchedSkills: [],
          missingSkills: [],
          suggestions: [responseText || "No suggestions available"],
          percentageMatch: 0,
        };
      }

      res.json(resultJSON);
    } catch (err) {
      console.error("Resume match error:", err);
      res.status(500).json({ message: "Error processing resume PDF" });
    }
  },
];

module.exports = { matchResumePDF, callGroq };
