import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../css/Dashboard.css";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // ---------------- SOCKET CONNECTION ----------------
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      socket.connect();
      socket.emit("registerUser", user._id);
    }, 400);

    socket.on("receiveNotification", (data) => {
      setNotifications((prev) => [...prev, data]);
      toast.info(data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    });

    return () => {
      clearTimeout(timer);
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
        setDashboardData(res.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  // ---------------- FILTERED DATA ----------------
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

  // ---------------- UPDATE STATUS ----------------
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
      toast.error("Failed to update status");
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

 const handleDeleteAccount = async () => {
  if (!window.confirm("⚠️ Are you sure you want to permanently delete your account?")) return;

  try {
    const userId = user._id;
    await axios.delete(
      `https://careerconnect-d6ke.onrender.com/api/users/delete/${userId}`,
      { withCredentials: true }
    );
    localStorage.removeItem("user");
    toast.success("Account deleted successfully!");
    setTimeout(() => navigate("/login"), 2000);
  } catch (err) {
    console.error("Error deleting account:", err);
    toast.error("Failed to delete account");
  }
};


  const handleEditJob = (job) => navigate(`/edit-job/${job._id}`);

  // ---------------- LOADING STATE ----------------
  if (!user)
    return (
      <h4 className="text-center mt-5 text-danger">
        Please login to view dashboard
      </h4>
    );
  if (loading)
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary mb-3" />
        <p className="text-muted">Fetching your dashboard...</p>
      </div>
    );

  // ---------------- UI ----------------
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary mb-0">Welcome, {user.name}</h3>
        <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
          🗑️ Delete Account
        </button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="alert alert-info mb-4">
          <strong>🔔 Notifications:</strong>
          <ul className="mb-0">
            {notifications.slice(-3).map((n, i) => (
              <li key={`${n.message}-${i}`}>{n.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- JOBSEEKER SECTION ---------------- */}
      {user.role === "jobseeker" && (
        <>
          {/* Search Bar Patch */}
          <div className="card shadow-sm border-0 p-3 mb-4">
            <h6 className="fw-semibold text-secondary mb-2">
              🔍 Search Applied Jobs
            </h6>
            <input
              type="text"
              className="form-control"
              placeholder="Type job title or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Resume Matcher + Home Buttons Patch */}
          <div className="d-flex justify-content-center">
            <div className="card shadow-sm border-0 p-3 mb-4" style={{ width: "500px" }}>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <a href="/resume-match" className="btn btn-outline-primary px-4">
                  🧾 Resume Matcher
                </a>
                <a href="/" className="btn btn-outline-secondary px-4">
                  🏠 Back to Home
                </a>
              </div>
            </div>
          </div>

          {/* Jobs Section */}
          {filteredData.length === 0 ? (
            <div className="alert alert-warning text-center">
              No jobs found for "{searchTerm || "your applied list"}".
            </div>
          ) : (
            <div className="row g-4">
              {filteredData.map((job, index) => (
                <div key={`${job._id}-${index}`} className="col-md-6 col-lg-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-primary fw-semibold">{job.jobname}</h5>
                      <h6 className="card-subtitle mb-3 text-muted">{job.companyname}</h6>
                      <ul className="list-unstyled mb-4">
                        <li><strong>Type:</strong> {job.jobtype}</li>
                        <li><strong>Location:</strong> {job.location || "N/A"}</li>
                        <li><strong>Salary:</strong> {job.salary || "N/A"}</li>
                        <li>
                          <strong>Status:</strong>{" "}
                          <span
                            className="px-3 py-1 rounded text-white"
                            style={{
                              backgroundColor:
                                job.status === "Selected"
                                  ? "#FFD700"
                                  : job.status === "Rejected"
                                  ? "#FF4C4C"
                                  : job.status === "Call for Interview"
                                  ? "#28C76F"
                                  : "#B0B0B0",
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
                        💬 Message Recruiter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------------- RECRUITER SECTION ---------------- */}
      {user.role === "recruiter" && (
        <>
          {/* Search Bar Patch */}
          <div className="card shadow-sm border-0 p-3 mb-4">
            <h6 className="fw-semibold text-secondary mb-2">
              🔍 Search Job or Applicant
            </h6>
            <input
              type="text"
              className="form-control"
              placeholder="Type job title or applicant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Analytics + Home Buttons Patch */}
          <div className="card shadow-sm border-0 p-3 mb-4">
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <a href="/analytics" className="btn btn-outline-primary px-4">
                📊 Analytics
              </a>
              <a href="/" className="btn btn-outline-secondary px-4">
                🏠 Back to Home
              </a>
            </div>
          </div>

          {/* Job List */}
          {filteredData.length === 0 ? (
            <div className="alert alert-info text-center">
              No jobs or applicants found for "{searchTerm}".
            </div>
          ) : (
            <div className="accordion" id="jobsAccordion">
              {filteredData.map((job, index) => (
                <div key={`${job._id}-${index}`} className="accordion-item mb-3 shadow-sm rounded">
                  <h2 className="accordion-header" id={`heading-${index}`}>
                    <button
                      className="accordion-button collapsed fw-semibold text-primary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${index}`}
                      onClick={() =>
                        setExpandedJobId(expandedJobId === job._id ? null : job._id)
                      }
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

                      {/* Lazy load applications only when expanded */}
                      {expandedJobId === job._id && (
                        <JobApplicationsList
                          key={`apps-${job._id}`}
                          job={job}
                          updateStatus={updateStatus}
                          navigate={navigate}
                        />
                      )}
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
const JobApplicationsList = React.memo(function JobApplicationsList({
  job,
  updateStatus,
  navigate,
}) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(job.applications.length / perPage);
  const visibleApps = job.applications.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <h6 className="fw-semibold mb-3">
        📥 Applications ({job.applications.length})
      </h6>
      {visibleApps.length === 0 ? (
        <p className="text-muted">No applications found.</p>
      ) : (
        <div className="list-group">
          {visibleApps.map((app, index) => (
            <div
              key={`${app._id}-${index}`}
              className="list-group-item p-3 mb-2 shadow-sm rounded"
            >
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
                    updateStatus(app._id, "Call for Interview", app.applicantId)
                  }
                >
                  Interview
                </button>
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() =>
                    updateStatus(app._id, "Selected", app.applicantId)
                  }
                >
                  Select
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() =>
                    updateStatus(app._id, "Rejected", app.applicantId)
                  }
                >
                  Reject
                </button>
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() =>
                    navigate(`/chat/${job._id}/${app.applicantId}`)
                  }
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ◀ Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
});

export default Dashboard;
