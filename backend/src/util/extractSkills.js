const fs = require("fs");
const pdfParse = require("pdf-parse");
const docx = require("docx");

const SKILLS_LIST = [
  "JavaScript", "React", "Node.js", "Python", "Java",
  "C++", "HTML", "CSS", "SQL", "MongoDB", "AWS"
];

// ---------------- Extract text from PDF ----------------
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// ---------------- Extract text from DOCX ----------------
async function extractTextFromDOCX(filePath) {
  const { Document, Packer } = require("docx");
  const { readFileSync } = require("fs");
  const doc = await docx.Document.load(readFileSync(filePath));
  let text = "";
  doc.paragraphs.forEach(p => {
    text += p.text + " ";
  });
  return text;
}

// ---------------- Extract skills from resume text ----------------
function extractSkillsFromText(resumeText) {
  const skillsFound = SKILLS_LIST.filter(skill =>
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  return skillsFound;
}

// ---------------- Main function ----------------
async function extractSkillsFromResume(fileUrl) {
  let resumeText = "";

  if (fileUrl.endsWith(".pdf")) {
    resumeText = await extractTextFromPDF(fileUrl);
  } else if (fileUrl.endsWith(".docx")) {
    resumeText = await extractTextFromDOCX(fileUrl);
  } else {
    throw new Error("Unsupported file type. Only PDF or DOCX allowed.");
  }

  const skills = extractSkillsFromText(resumeText);
  return skills;
}

module.exports = extractSkillsFromResume;