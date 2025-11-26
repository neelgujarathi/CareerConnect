import React, { useState } from "react";
import axios from "axios";

function ResumeMatchPDF() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => setResumeFile(e.target.files[0]);

  const handleMatch = async () => {
    if (!resumeFile || !jobDescription) {
      setError("Please select a resume PDF and enter job description.");
      return;
    }

    setError("");
    setLoading(true);
    setMatchResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const res = await axios.post(
        "https://careerconnect-d6ke.onrender.com/api/ai/resume-match",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMatchResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error matching resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5"
      style={{ maxWidth: "900px", fontFamily: "Arial, sans-serif" }}
    >
      <h2 className="mb-4 text-center">AI Resume Matcher</h2>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Upload Resume & Job Description</h5>
          <div className="mb-3">
            <input
              type="file"
              accept=".pdf"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="5"
              placeholder="Paste job description here"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
          <button
            className="btn btn-primary w-100"
            onClick={handleMatch}
            disabled={loading}
          >
            {loading ? "Matching..." : "Check Match"}
          </button>
          {error && <p className="text-danger mt-3">{error}</p>}
        </div>
      </div>

      {matchResult && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Resume Match Result</h5>
            <div className="mb-3">
              <strong>Match Percentage:</strong>
              <div className="progress mt-2" style={{ height: "25px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{
                    width: `${matchResult.percentageMatch}%`,
                    backgroundColor: "#0d6efd",
                  }}
                >
                  {matchResult.percentageMatch}%
                </div>
              </div>
            </div>
            <div className="mb-3">
              <strong>Matched Skills:</strong>
              <div className="mt-2">
                {(matchResult.matchedSkills || []).length > 0 ? (
                  matchResult.matchedSkills.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: "#198754 !important",
                        color: "#fff",
                        fontSize: "0.9rem",
                        padding: "5px 10px",
                        borderRadius: "12px",
                        display: "inline-block",
                        marginRight: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span>None</span>
                )}
              </div>
            </div>
            <div className="mb-3">
              <strong>Missing Skills:</strong>
              <div className="mt-2">
                {(matchResult.missingSkills || []).length > 0 ? (
                  matchResult.missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: "#dc3545 !important",
                        color: "#fff",
                        fontSize: "0.9rem",
                        padding: "5px 10px",
                        borderRadius: "12px",
                        display: "inline-block",
                        marginRight: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span>None</span>
                )}
              </div>
            </div>
            <div className="mb-3">
              <strong>Suggestions:</strong>
              <ul className="mt-2">
                {(matchResult.suggestions || ["No suggestions"]).map(
                  (s, i) => (
                    <li key={i}>{s}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeMatchPDF;
