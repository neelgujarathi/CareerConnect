import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/postjob.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Postjob() {
  const [formData, setFormData] = useState({
    jobname: "",
    companyname: "",
    jobtype: "",
    location: "",
    salary: "",
    description: "",
    requiredSkills: "",
  });

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

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // ---------------- FORM SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      toast.error("❌ You must be logged in to post a job", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      const skillsArray = formData.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const payload = {
        ...formData,
        requiredSkills: skillsArray,
        recruiterId: user._id,
      };

      const res = await axios.post("https://careerconnect-d6ke.onrender.com/api/jobs", payload);
      socket.emit("sendNotification", {
        message: `💼 New Job Posted: ${formData.jobname} at ${formData.companyname}`,
      });
      setFormData({
        jobname: "",
        companyname: "",
        jobtype: "",
        location: "",
        salary: "",
        description: "",
        requiredSkills: "",
      });
    } catch (err) {
      console.error("❌ Error posting job:", err);
      toast.error("❌ Failed to post job!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="jobform p-4 shadow rounded bg-white">
        <h4 className="text-center mb-4">Post a New Job</h4>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="jobname" className="form-label">
                Enter Job Name:
              </label>
              <input
                type="text"
                className="form-control"
                id="jobname"
                placeholder="MERN Stack Developer, AI/ML Developer, Intern"
                value={formData.jobname}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="companyname" className="form-label">
                Enter Company Name:
              </label>
              <input
                type="text"
                className="form-control"
                id="companyname"
                placeholder="Enter Company Name"
                value={formData.companyname}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="jobtype" className="form-label">
                Enter Job Type:
              </label>
              <input
                type="text"
                className="form-control"
                id="jobtype"
                placeholder="Remote, Full-Time, Internship, etc."
                value={formData.jobtype}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="location" className="form-label">
                Enter Job Location:
              </label>
              <input
                type="text"
                className="form-control"
                id="location"
                placeholder="Enter Job Location or Remote"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="salary" className="form-label">
                Enter Salary / Stipend:
              </label>
              <input
                type="text"
                className="form-control"
                id="salary"
                placeholder="Enter Salary or Stipend"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="description" className="form-label">
                Enter Description:
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                placeholder="Enter short job description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="col-md-12 mb-3">
              <label htmlFor="requiredSkills" className="form-label">
                Required Skills (comma-separated):
              </label>
              <input
                type="text"
                className="form-control"
                id="requiredSkills"
                placeholder="e.g., React, Node.js, MongoDB, AWS"
                value={formData.requiredSkills}
                onChange={handleChange}
              />
              <small className="text-muted">
                Separate multiple skills with commas. Example: React, Node.js,
                MongoDB
              </small>
            </div>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary px-5">
              Post Job
            </button>
            <a href="/" className="btn btn-secondary px-5 ms-3">
              Back to Home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Postjob;
