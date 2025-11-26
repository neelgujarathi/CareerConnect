import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

function RecruiterAnalytics() {
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => 
  {
    if (!user || user.role !== "recruiter") return;

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`https://careerconnect-d6ke.onrender.com/api/dashboard/recruiter/analytics`, {
          params: { recruiterId: user._id },
        });
        setJobsData(res.data);
      } catch (err) {
        console.error("Error fetching recruiter analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);


  if (!user || user.role !== "recruiter")
    return <h4 className="text-center mt-5 text-danger">Access denied</h4>;

  if (loading)
    return <h4 className="text-center mt-5 text-secondary">Loading analytics...</h4>;

  const applicantsPerJob = jobsData.map((job) => ({
  job: job.jobname,
  applicants: job.totalApplications, 
}));

const topAppliedJobs = [...applicantsPerJob]
  .sort((a, b) => b.applicants - a.applicants)
  .slice(0, 5);

const skillGapData = jobsData.flatMap((job) => job.skillGaps);
  let skillCounts = {};
  jobsData.forEach((job) => {
    job.applications.forEach((app) => {
      if (app.missingSkills) {
        app.missingSkills.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

  return (
    <div className="container py-5">
      <h3 className="mb-5 text-primary text-center">Recruiter Analytics Dashboard</h3>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">📊 Applicants per Job</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicantsPerJob}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="job" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applicants" fill="#0d6efd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">🏆 Top Applied Jobs</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topAppliedJobs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="job" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applicants" fill="#28C76F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-12">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">⚠️ Skill Gaps Across Applications</h5>
            {skillGapData.length === 0 ? (
              <p className="text-muted">No skill gap data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={skillGapData}
                    dataKey="count"
                    nameKey="skill"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                  >
                    {skillGapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterAnalytics;