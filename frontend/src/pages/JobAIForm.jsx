import React, { useState } from "react";
import axios from "axios";
import "../css/JobAIForm.css";

function JobAIForm() {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [perks, setPerks] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setResult("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://careerconnect-d6ke.onrender.com/api/ai/generate-jobdesc",
        { role, skills, experience, perks }
      );
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Error generating job description");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert("✅ Job description copied to clipboard!");
  };

  return (
    <div className="jobai-container d-flex justify-content-center align-items-center">
      <div className="jobai-card p-4 shadow-lg rounded">
        <h2 className="text-center mb-4">AI Job Description Generator</h2>

        {/* Input Fields */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Perks"
            value={perks}
            onChange={(e) => setPerks(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <button
          className="btn btn-primary w-100 jobai-btn d-flex align-items-center justify-content-center"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </button>

        {/* Error Message */}
        {error && <p className="text-danger mt-3">{error}</p>}

        {/* Result Output */}
        {result && (
          <>
            <pre className="jobai-result mt-3 p-3 bg-light border rounded">
              {result}
            </pre>
            <button
              className="btn btn-success mt-2"
              onClick={handleCopy}
            >
              Copy Description
            </button>
          </>
        )}

        {/* Back Button */}
        <a
          href="/"
          style={{ display: "inline-block", marginTop: "10px", textDecoration: "none" }}
        >
          ⬅ Back to Home
        </a>
      </div>
    </div>
  );
}

export default JobAIForm;
