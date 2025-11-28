import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // ✅ For Accordion toggle
import "../css/Dashboard.css";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
          res = await axios.get(
            "https://careerconnect-d6ke.onrender.com/api/dashboard/jobseeker",
            { params: { userId: user._id } }
          );
        } else if (user.role === "recruiter") {
          res = await axios.get(
            "https://careerconnect-d6ke.onrender.com/api/dashboard/recruiter",
            { params: { recruiterId: user._id } }
          );
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

  // ---------------- FILTERED DATA (useMemo for both roles) ----------------
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return dashboardData;

    if (user?.role === "recruiter") {
      return dashboardData
        .map((job) => {
          const jobMatch = job.jobname.toLowerCase().includes(term);
          const matchingApplicants = job.applications.filter((app) =>
            app.applicantName.toLowerCase().includes(term)
          );
          if (jobMatch || matchingApplicants.length > 0) {
            return {
              ...job,
              applications: jobMatch ? job.applications : matchingApplicants,
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (user?.role === "jobseeker") {
      return dashboardData.filter(
        (job) =>
          job.jobname.toLowerCase().includes(term) ||
          job.companyname.toLowerCase().includes(term)
      );
    }

    return dashboardData;
  }, [searchTerm, dashboardData, user?.role]);

  // ---------------- UPDATE APPLICATION STATUS ----------------
  const updateStatus = async (applicationId, newStatus, applicantId) => {
    try {
      await axios.put(
        `https://careerconnect-d6ke.onrender.com/api/application/status/${applicationId}`,
        { status: newStatus }
      );

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

      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status", { autoClose: 3000 });
    }
  };

  // ---------------- DELETE JOB ----------------
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(
        `https://careerconnect-d6ke.onrender.com/api/jobs/${jobId}?recruiterId=${user._id}`
      );
      setDashboardData((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  const handleEditJob = (job) => navigate(`/edit-job/${job._id}`);

  // ---------------- RENDER UI ----------------
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

  return (
    <div className="container py-5">
      <h3 className="mb-4 fw-bold text-primary">Welcome, {user.name}</h3>

      {/* ---------------- NOTIFICATIONS ---------------- */}
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold">💼 Jobs You Applied For</h5>
            <input
              type="text"
              className="form-control w-50"
              placeholder="🔍 Search applied jobs by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-center gap-3 mb-3">
            <a
              href="/resume-match"
              className="btn btn-outline-primary"
            >
              Resume Matcher
            </a>
            <a href="/" className="btn btn-secondary">
              Back to Home
            </a>
          </div>

          {filteredData.length === 0 ? (
            <div className="alert alert-warning text-center">
              No jobs found for "{searchTerm || "your applied list"}".
            </div>
          ) : (
            <div className="row g-4">
              {filteredData.map((job) => (
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
                        <li><strong>Type:</strong> {job.jobtype}</li>
                        <li><strong>Location:</strong> {job.location || "N/A"}</li>
                        <li><strong>Salary:</strong> {job.salary || "N/A"}</li>
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
            </div>
          )}
        </>
      )}

      {/* ---------------- RECRUITER DASHBOARD ---------------- */}
      {user.role === "recruiter" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-semibold">📋 Jobs You Posted</h5>
            <input
              type="text"
              className="form-control w-50"
              placeholder="🔍 Search job title or applicant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <center>
            <a href="/analytics" className="btn btn-secondary mb-3">
              Analytics
            </a>
            <a href="/" className="btn btn-secondary mt-3 analysis">
              Back to Home
            </a>
          </center>

          {filteredData.length === 0 ? (
            <div className="alert alert-info text-center">
              No jobs or applicants found for "{searchTerm}".
            </div>
          ) : (
            <div className="accordion" id="jobsAccordion">
              {filteredData.map((job, index) => (
                <div
                  className="accordion-item mb-3 shadow-sm rounded"
                  key={job._id}
                >
                  <h2 className="accordion-header" id={`heading-${index}`}>
                    <button
                      className="accordion-button collapsed fw-semibold text-primary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${index}`}
                      aria-expanded="false"
                      aria-controls={`collapse-${index}`}
                    >
                      {job.jobname} — {job.companyname}
                      <span className="badge bg-secondary ms-2">
                        {job.applications.length} applications
                      </span>
                    </button>
                  </h2>
                  <div
                    id={`collapse-${index}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`heading-${index}`}
                    data-bs-parent="#jobsAccordion"
                  >
                    <div className="accordion-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <span className="me-3"><strong>Type:</strong> {job.jobtype}</span>
                          <span className="me-3"><strong>Location:</strong> {job.location || "N/A"}</span>
                          <span><strong>Salary:</strong> {job.salary || "N/A"}</span>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleEditJob(job)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteJob(job._id)}>Delete</button>
                        </div>
                      </div>

                      <JobApplicationsList job={job} updateStatus={updateStatus} navigate={navigate} />
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

// ---------------- PAGINATED APPLICATIONS COMPONENT ----------------
function JobApplicationsList({ job, updateStatus, navigate }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(job.applications.length / perPage);
  const start = (page - 1) * perPage;
  const visibleApps = job.applications.slice(start, start + perPage);

  return (
    <div>
      <h6 className="fw-semibold mb-3">📥 Applications ({job.applications.length})</h6>
      {visibleApps.length === 0 ? (
        <p className="text-muted">No applications found.</p>
      ) : (
        <div className="list-group">
          {visibleApps.map((app) => (
            <div key={app._id} className="list-group-item d-flex flex-column gap-2 p-3 mb-2 shadow-sm rounded" style={{ backgroundColor: "#f9f9f9" }}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{app.applicantName}</span>
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
                  <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">View Resume</a>
                )}
                <button className="btn btn-sm btn-outline-success" onClick={() => updateStatus(app._id, "Call for Interview", app.applicantId)}>Interview</button>
                <button className="btn btn-sm btn-outline-warning" onClick={() => updateStatus(app._id, "Selected", app.applicantId)}>Select</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(app._id, "Rejected", app.applicantId)}>Reject</button>
                <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/chat/${job._id}/${app.applicantId}`)}>Message</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ◀ Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
