import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/jobdescription.css";
import "bootstrap/dist/css/bootstrap.min.css";

function JobDescription() {
  const { id } = useParams(); 
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`https://careerconnect-d6ke.onrender.com/api/jobs/${id}`);
        setJob(res.data.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };
    fetchJob();
  }, [id]);

  if (!job) return <h4 className="text-center mt-5 text-secondary">Loading job details...</h4>;

  return (
    <center>
      <div className="card shadow-sm h-100 jobcard mt-4" style={{ width: "60%" }}>
        <h5 className="card-header">{job.jobname}</h5>
        <div className="card-body text-start">
          <h5 className="card-title">Company Name: {job.companyname}</h5>
          <p className="card-text">
            <strong>Job Type:</strong> {job.jobtype}<br />
            <strong>Location:</strong> {job.location}<br />
            <strong>Salary:</strong> {job.salary}
          </p>
          <div className="card-text mt-3" style={{ whiteSpace: "pre-line", lineHeight: "1.6", fontSize: "1rem" }}>
            <strong>Description:</strong><br />
            {job.description}
          </div>
          <div className="d-flex gap-3 mt-3">
            <a href={`/apply/${job._id}`} className="btn btn-success">Apply Now</a>
            <a href="/" className="btn btn-secondary">Back to Home</a>
          </div>

        </div>
      </div>
    </center>
  );
}

export default JobDescription;
