import React, { useState } from "react";
import axios from "axios";
import "../css/JobAIHelper.css";

function JobAIHelper() {
  const [jobDescription, setJobDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    setError(""); 
    setSummary("");
    if (!jobDescription) return setError("Enter job description first");
    setLoading(true);

    try {
      const res = await axios.post("https://careerconnect-d6ke.onrender.com/api/ai/summarize-jobdesc", { jobDescription });
      setSummary(res.data.result);
    } catch (err) {
      console.error("Frontend error:", err);
      setError(err.response?.data?.message || "Error summarizing job description");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestions = async () => {
    setError(""); 
    setQuestions("");
    if (!jobDescription) return setError("Enter job description first");
    setLoading(true);

    try {
      const res = await axios.post("https://careerconnect-d6ke.onrender.com/api/ai/interview-questions", { jobDescription });
      setQuestions(res.data.result);
    } catch (err) {
      console.error("Frontend error:", err);
      setError(err.response?.data?.message || "Error generating interview questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="helper-container d-flex justify-content-center align-items-start">
      <div className="helper-card p-4 shadow-lg rounded">
        <h2 className="text-center mb-4">AI Job Assistant</h2>

        <div className="mb-3">
          <textarea
            placeholder="Paste job description here"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            rows={6}
            className="form-control helper-textarea"
          />
        </div>

        <div className="d-flex gap-2 flex-wrap mb-3">
          <button className="btn btn-primary flex-grow-1" onClick={handleSummarize} disabled={loading}>
            {loading ? "Processing..." : "Summarize Job Description"}
          </button>
          <button className="btn btn-success flex-grow-1" onClick={handleQuestions} disabled={loading}>
            {loading ? "Processing..." : "Generate Interview Questions"}
          </button>
        </div>

        {error && <p className="text-danger">{error}</p>}

        {summary && (
          <div className="result-box mb-3">
            <h5>Summary:</h5>
            <pre>{summary}</pre>
          </div>
        )}

        {questions && (
          <div className="result-box">
            <h5>Interview Questions:</h5>
            <pre>{questions}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobAIHelper;
