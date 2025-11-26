import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/mainContent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";

function MainContent() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
       const res = await axios.get("https://careerconnect-d6ke.onrender.com/api/jobs");
        setJobs(res.data.data || []); 
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="main d-flex flex-wrap justify-content-center gap-4 p-4">
      {jobs.length === 0 ? (
        <h5 className="text-secondary">No jobs posted yet.</h5>
      ) : (
        jobs.map((job, index) => (
          
            <div key={index} className="card shadow-sm" style={{ width: "28rem", position: "relative" }}>
            

            <div className="card-body">
              <h5 className="card-title">{job.jobname}</h5>
              <h6 className="card-subtitle mb-2 text-body-secondary">{job.companyname}</h6>
              <p className="card-text">{job.location || "Location not specified"}</p>

              <div className="d-flex gap-2 mt-2">
                <span className="badge text-bg-success">
                  <FontAwesomeIcon icon={["fas", "check"]} /> {job.jobtype}
                </span>
                <span className="badge text-bg-primary">
                  <FontAwesomeIcon icon={["fas", "indian-rupee-sign"]} /> {job.salary || "N/A"}
                </span>
              </div>
              <a href={`/job/${job._id}`} className="btn btn-outline-primary mt-3">
                View Details
              </a>

            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MainContent;
