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

  const handleSubmit = async () => {
    setError("");
    setResult("");
    try {
      const res = await axios.post("http://localhost:3000/api/ai/generate-jobdesc", {
        role, skills, experience, perks
      });
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Error generating job description");
    }
  };

  return (
    <div className="jobai-container d-flex justify-content-center align-items-center">
      <div className="jobai-card p-4 shadow-lg rounded">
        <h2 className="text-center mb-4">AI Job Description Generator</h2>

        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Skills"
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Experience"
            value={experience}
            onChange={e => setExperience(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control jobai-input"
            placeholder="Perks"
            value={perks}
            onChange={e => setPerks(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-100 jobai-btn" onClick={handleSubmit}>
          Generate
        </button>

        {error && <p className="text-danger mt-3">{error}</p>}
        {result && <pre className="jobai-result mt-3">{result}</pre>}
       <a href="/" style={{ display: "inline-block", marginTop: "10px" }}>
          Back to Home
      </a>

      </div>
    </div>
  );
}

export default JobAIForm;
