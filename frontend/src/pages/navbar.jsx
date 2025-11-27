import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/navbarcss.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    navigate("/"); 
  };

  return (
    <div className="nav">
      <div className="logo">
        <img src="../logo.jpg" />
      </div>
      <a href="#">Home</a>
      <a href="/salary-guidance">Salary Guide</a>
      {user?.role === "recruiter" && <a href="/post-job">Post Job</a>}
      {user?.role === "recruiter" && <a href="/job-ai">Job Descriptor</a>}
      <a href="/dashboard">My Dashboard</a>

      <div className="login">
        {user?.role === "jobseeker" && <a href="/ai-helper">AI Assistant</a>}
        {!user && <a href="/register" className="RL">Sign Up</a>}
        {!user && <a href="/login" className="RL">Sign In</a>}
        {user && (
          <>
            <span className="proname">Welcome, {user.name}</span>
            <button className="logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;