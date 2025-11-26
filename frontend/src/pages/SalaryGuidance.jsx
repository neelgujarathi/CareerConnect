import React, { useState } from "react";
import axios from "axios";
import "../css/SalaryGuidance.css";

function SalaryGuidance() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [city, setCity] = useState("");
  const [salary, setSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSalaryEstimate = async () => {
    setError("");
    setSalary("");

    if (!role || !experience || !companyType || !city) {
      return setError("Please fill all the fields.");
    }

    setLoading(true);
    try {
      const res = await axios.post("https://careerconnect-d6ke.onrender.com/api/ai/salary-guidance", {
        role,
        experience,
        companyType,
        city,
    });
setSalary(res.data.result);

    } catch (err) {
      console.error("Frontend error:", err);
      setError(err.response?.data?.message || "Error fetching salary guidance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salary-container d-flex justify-content-center align-items-start">
      <div className="salary-card p-4 shadow-lg rounded">
        <h2 className="text-center mb-4">AI Salary Guidance</h2>

        <div className="mb-3">
          <input
            type="text"
            className="form-control salary-input"
            placeholder="Job Role (e.g., MERN Stack Developer)"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="text"
            className="form-control salary-input"
            placeholder="Experience (e.g., 2 years)"
            value={experience}
            onChange={e => setExperience(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <select
            className="form-select salary-input"
            value={companyType}
            onChange={e => setCompanyType(e.target.value)}
          >
            <option value="">Select Company Type</option>
            <option value="Startup">Startup</option>
            <option value="SME">SME</option>
            <option value="MNC">MNC</option>
            <option value="Product-based">Product-based</option>
            <option value="Service-based">Service-based</option>
          </select>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className="form-control salary-input"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary w-100 salary-btn"
          onClick={handleSalaryEstimate}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Get Salary Guidance"}
        </button>

        {error && <p className="text-danger mt-3">{error}</p>}

        {salary && (
          <div className="salary-result mt-3">
            <h5>Estimated Salary:</h5>
            <pre>{salary}</pre>
          </div>
        )}
         <a href="/" style={{ display: "inline-block", marginTop: "10px" }}>
          Back to Home
      </a>
      </div>
    </div>
  );
}

export default SalaryGuidance;
