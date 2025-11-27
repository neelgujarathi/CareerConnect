import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import "../css/UserRegister.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserRegister() {
  const [role, setRole] = useState("jobseeker"); 
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contact: "",
    username: "",
    password: "",
    company: "",
  });
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://careerconnect-d6ke.onrender.com/api/register", {
        ...userData,
        role,
      });

      toast.success("✅ User Registered Successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      console.log(res.data);

      socket.emit("sendNotification", {
        message: `🎉 New ${role} registered: ${userData.name}`,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        "❌ Failed to register user! " +
          (error.response?.data?.message || error.message),
        { position: "top-right", autoClose: 4000, theme: "colored" }
      );
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="p-4 shadow rounded bg-white">
        <h4 className="text-center mb-4">Register</h4>
        <ul className="nav nav-tabs mb-4 justify-content-center">
          <li className="nav-item">
            <button
              className={`nav-link ${role === "jobseeker" ? "active" : ""} navClick`}
              onClick={() => setRole("jobseeker")}
            >
              Register as Job Seeker
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${role === "recruiter" ? "active" : ""} navClick`}
              onClick={() => setRole("recruiter")}
            >
              Register as Recruiter
            </button>
          </li>
        </ul>
         <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label">
                Full Name:
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter your name"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">
                Email:
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="contact" className="form-label">
                Contact No.:
              </label>
              <input
                type="text"
                className="form-control"
                id="contact"
                placeholder="Enter your contact no."
                value={userData.contact}
                onChange={handleChange}
                required
              />
            </div>
            {role === "recruiter" && (
              <div className="col-md-6 mb-3">
                <label htmlFor="company" className="form-label">
                  Company Name:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company"
                  placeholder="Enter your company name"
                  value={userData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="col-md-6 mb-3">
              <label htmlFor="username" className="form-label">
                Username:
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter your username"
                value={userData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="password" className="form-label">
                Password:
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={userData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-success px-5">
              Register
            </button>
          </div>
        </form>

        <a href="/" className="d-block text-center mt-3">
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default UserRegister;
