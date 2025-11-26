import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(true);

  // ---------------- SOCKET CONNECTION ----------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    socket.on("connect", () => socket.emit("registerUser", user._id));

    socket.on("receiveNotification", (data) => {
      toast.info(data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("receiveNotification");
    };
  }, []);

  // ---------------- FETCH JOB DETAILS ----------------
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`https://careerconnect-d6ke.onrender.com/api/jobs/${jobId}`);
        setJob(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job:", err);
        toast.error("❌ Failed to fetch job details!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };
    fetchJob();
  }, [jobId]);

  // ---------------- HANDLE UPDATE ----------------
  const handleSubmit = async () => {
    try {
      await axios.put(`https://careerconnect-d6ke.onrender.com/api/jobs/${jobId}`, {
        recruiterId: job.recruiterId,
        ...job,
      });

      socket.emit("sendNotification", {
        message: `📝 Job Updated: ${job.jobname} at ${job.companyname}`,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error updating job:", err);
      toast.error("❌ Failed to update job!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  // ---------------- RENDER ----------------
  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h3>Edit Job</h3>
      <input
        value={job.jobname}
        onChange={(e) => setJob({ ...job, jobname: e.target.value })}
        className="form-control mb-3"
        placeholder="Job Name"
      />
      <input
        value={job.companyname}
        onChange={(e) => setJob({ ...job, companyname: e.target.value })}
        className="form-control mb-3"
        placeholder="Company Name"
      />
      <input
        value={job.jobtype}
        onChange={(e) => setJob({ ...job, jobtype: e.target.value })}
        className="form-control mb-3"
        placeholder="Job Type"
      />
      <input
        value={job.location}
        onChange={(e) => setJob({ ...job, location: e.target.value })}
        className="form-control mb-3"
        placeholder="Location"
      />
      <input
        value={job.salary}
        onChange={(e) => setJob({ ...job, salary: e.target.value })}
        className="form-control mb-3"
        placeholder="Salary"
      />
      <button className="btn btn-primary" onClick={handleSubmit}>
        Update Job
      </button>
    </div>
  );
}

export default EditJob;
