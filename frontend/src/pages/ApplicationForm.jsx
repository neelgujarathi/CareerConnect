import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ApplicationForm() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", resume: null });

  // ------------------ SOCKET SETUP ------------------
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

  // ------------------ FORM SUBMISSION ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("❌ You must be logged in to apply!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("jobId", id);
    data.append("userId", user._id);
    data.append("resume", formData.resume);

    try {
      await axios.post("http://localhost:3000/api/apply", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Application submitted successfully!", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
      });

      socket.emit("sendNotification", {
        message: `🧑‍💼 ${formData.name} just applied for your job!`,
      });

      setTimeout(() => {
        navigate(`/job/${id}`);
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to submit application!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div
        className="p-4 shadow bg-white rounded"
        style={{ maxWidth: "600px", margin: "auto" }}
      >
        <h4 className="mb-4 text-center">Apply for this Job</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Resume (PDF/DOC)</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx"
              required
              onChange={(e) =>
                setFormData({ ...formData, resume: e.target.files[0] })
              }
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplicationForm;
