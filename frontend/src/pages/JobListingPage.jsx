import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";

function JobListingPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (search = false) => {
    try {
      setLoading(true);
      let res;

      if (search) {
        res = await axios.get("http://localhost:3000/api/jobs/search", {
          params: { query, location },
        });
        setJobs(res.data);
      } else {
        res = await axios.get("http://localhost:3000/api/jobs");
        setJobs(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchJobs(true);

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-center mb-5">
        <div
          className="d-flex align-items-center border rounded-pill shadow-sm bg-white overflow-hidden"
          style={{ width: "800px", maxWidth: "100%" }}
        >
          <div className="d-flex align-items-center px-3 flex-grow-1">
            <FontAwesomeIcon
              icon={["fas", "magnifying-glass"]}
              className="text-secondary me-2"
            />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control border-0"
              style={{ boxShadow: "none" }}
            />
          </div>

          <div className="border-start" style={{ height: "30px" }}></div>

          <div className="d-flex align-items-center px-3 flex-grow-1">
            <FontAwesomeIcon
              icon={["fas", "location-dot"]}
              className="text-secondary me-2"
            />
            <input
              type="text"
              placeholder='City, state, zip, or "remote"'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-control border-0"
              style={{ boxShadow: "none" }}
            />
          </div>

          <button
            className="btn btn-primary rounded-end-pill fw-semibold px-4"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Find Jobs"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-secondary">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center text-muted">No jobs found.</p>
      ) : (
        <div className="row">
          {jobs.map((job) => (
            <div key={job._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary fw-semibold">
                    {job.jobname}
                  </h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {job.companyname}
                  </h6>
                  <p className="card-text mt-3 small">
                    <strong>Type:</strong> {job.jobtype} <br />
                    <strong>Location:</strong> {job.location || "N/A"} <br />
                    <strong>Salary:</strong> {job.salary || "N/A"}
                  </p>
                  <a
                    href={`/job/${job._id}`}
                    className="btn btn-outline-primary w-100"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobListingPage;
