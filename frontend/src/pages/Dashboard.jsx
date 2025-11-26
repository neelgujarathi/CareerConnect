import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Dashboard.css";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // ---------------- SOCKET CONNECTION ----------------
  useEffect(() => {
    if (!user) return;

    socket.on("connect", () => {
      socket.emit("registerUser", user._id);
    });

    socket.on("receiveNotification", (data) => {
      setNotifications((prev) => [...prev, data]);
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
  }, [user]);

  // ---------------- FETCH DASHBOARD DATA ----------------
  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        let res;
        if (user.role === "jobseeker") {
          res = await axios.get("https://careerconnect-d6ke.onrender.com/api/dashboard/jobseeker", {
            params: { userId: user._id },
          });
        } else if (user.role === "recruiter") {
          res = await axios.get("https://careerconnect-d6ke.onrender.com/api/dashboard/recruiter", {
            params: { recruiterId: user._id },
          });
        }
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  // ---------------- UPDATE APPLICATION STATUS ----------------
  const updateStatus = async (applicationId, newStatus, applicantId) => {
    try {
      await axios.put(`https://careerconnect-d6ke.onrender.com/api/application/status/${applicationId}`, {
        status: newStatus,
      });

      setDashboardData((prevData) =>
        prevData.map((job) => ({
          ...job,
          applications: job.applications.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          ),
        }))
      );

      socket.emit("sendNotification", {
        to: applicantId,
        message: `Your application status has been updated to "${newStatus}".`,
      });

    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status", { autoClose: 3000 });
    }
  };

  // ---------------- DELETE JOB ----------------
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`https://careerconnect-d6ke.onrender.com/api/jobs/${jobId}?recruiterId=${user._id}`);
      setDashboardData((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  if (!user)
    return (
      <h4 className="text-center mt-5 text-danger">
        Please login to view dashboard
      </h4>
    );

  if (loading)
    return (
      <h4 className="text-center mt-5 text-secondary">Loading dashboard...</h4>
    );

  const handleEditJob = (job) => navigate(`/edit-job/${job._id}`);

  // ---------------- RENDER UI ----------------
  return (
    <div className="container py-5">
      <h3 className="mb-5 fw-bold text-primary">Welcome, {user.name}</h3>
      {notifications.length > 0 && (
        <div className="alert alert-info mb-4">
          <strong>🔔 Notifications:</strong>
          <ul className="mb-0">
            {notifications.slice(-3).map((n, i) => (
              <li key={i}>{n.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- JOBSEEKER DASHBOARD ---------------- */}
      {user.role === "jobseeker" && (
        <>
          <h5 className="fw-semibold mb-4">💼 Jobs You Applied For</h5>
          {dashboardData.length === 0 ? (
            <div className="alert alert-warning">
              You haven’t applied to any jobs yet.
            </div>
          ) : (
            <div className="row g-4">
              {dashboardData.map((job) => (
                <div key={job._id} className="col-md-6 col-lg-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-primary fw-semibold">
                        {job.jobname}
                      </h5>
                      <h6 className="card-subtitle mb-3 text-muted">
                        {job.companyname}
                      </h6>

                      <ul className="list-unstyled mb-4">
                        <li>
                          <strong>Type:</strong> {job.jobtype}
                        </li>
                        <li>
                          <strong>Location:</strong> {job.location || "N/A"}
                        </li>
                        <li>
                          <strong>Salary:</strong> {job.salary || "N/A"}
                        </li>
                        <li>
                          <strong>Status:</strong>{" "}
                          <span
                            className="status-badge px-3 py-1 rounded"
                            style={{
                              backgroundColor:
                                job.status === "Selected"
                                  ? "#FFD700"
                                  : job.status === "Rejected"
                                  ? "#FF4C4C"
                                  : job.status === "Call for Interview"
                                  ? "#28C76F"
                                  : "#B0B0B0",
                              color: "#fff",
                              fontWeight: "500",
                            }}
                          >
                            {job.status || "Pending"}
                          </span>
                        </li>
                      </ul>

                      <button
                        className="btn btn-outline-success mt-auto w-100"
                        onClick={() =>
                          navigate(`/chat/${job._id}/${job.recruiterId}`)
                        }
                      >
                        Message Recruiter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <a href="/resume-match" className="mt-3 d-block text-center">
                Resume Matcher
              </a>
            </div>
          )}
        </>
      )}

      {/* ---------------- RECRUITER DASHBOARD ---------------- */}
      {user.role === "recruiter" && (
        <>
          <h5 className="fw-semibold mb-4">📋 Jobs You Posted</h5>
          <center>
            <a href="/analytics" className="btn btn-secondary mb-3">
              Analytics
            </a>
          
            <a href="/" className="btn btn-secondary mt-3 analysis">
              Back to Home
            </a>
          </center>

          {dashboardData.length === 0 ? (
            <div className="alert alert-info">
              You haven’t posted any jobs yet.
            </div>
          ) : (
            <div className="row g-4">
              {dashboardData.map((job) => (
                <div key={job._id} className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h5 className="card-title text-primary fw-semibold">
                            {job.jobname}
                          </h5>
                          <h6 className="card-subtitle text-muted">
                            {job.companyname}
                          </h6>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleEditJob(job)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="me-3">
                          <strong>Type:</strong> {job.jobtype}
                        </span>
                        <span className="me-3">
                          <strong>Location:</strong> {job.location || "N/A"}
                        </span>
                        <span>
                          <strong>Salary:</strong> {job.salary || "N/A"}
                        </span>
                      </div>

                      <div>
                        <h6 className="fw-semibold mb-3">
                          📥 Received Applications ({job.applications.length})
                        </h6>
                        {job.applications.length === 0 ? (
                          <p className="text-muted">No applications yet.</p>
                        ) : (
                          <div className="list-group">
                            {job.applications.map((app) => (
                              <div
                                key={app._id}
                                className="list-group-item d-flex flex-column gap-2 p-3 mb-2 shadow-sm rounded"
                                style={{ backgroundColor: "#f9f9f9" }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="fw-semibold">
                                    {app.applicantName}
                                  </span>
                                  <span
                                    className={`badge ${
                                      app.status === "Selected"
                                        ? "bg-warning text-dark"
                                        : app.status === "Rejected"
                                        ? "bg-danger"
                                        : app.status === "Call for Interview"
                                        ? "bg-success"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {app.status || "Pending"}
                                  </span>
                                </div>

                                <div className="d-flex flex-wrap gap-2 mt-2">
                                  {app.resumeUrl && (
                                    <a
                                      href={app.resumeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-sm btn-outline-primary"
                                    >
                                      View Resume
                                    </a>
                                  )}
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                      updateStatus(
                                        app._id,
                                        "Call for Interview",
                                        app.applicantId
                                      )
                                    }
                                  >
                                    Interview
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() =>
                                      updateStatus(
                                        app._id,
                                        "Selected",
                                        app.applicantId
                                      )
                                    }
                                  >
                                    Select
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      updateStatus(
                                        app._id,
                                        "Rejected",
                                        app.applicantId
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => {
                                      if (!app.applicantId) {
                                        alert(
                                          "Applicant ID missing. Please refresh."
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/chat/${job._id}/${app.applicantId}`
                                      );
                                    }}
                                  >
                                    Message
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ToastContainer />
    </div>
  );
}

export default Dashboard;
