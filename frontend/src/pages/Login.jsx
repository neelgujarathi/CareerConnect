import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Login.css";
import { socket } from "../utils/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // ---------------- HANDLE LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("https://careerconnect-d6ke.onrender.com/api/auth/login", {
        emailOrUsername,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("✅ " + res.data.message, {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      socket.emit("sendNotification", {
        message: `🎉 ${res.data.user.name || "User"} just logged in!`,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "❌ Login failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <ToastContainer />

      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">Welcome Back 👋</h3>
          <p className="text-muted">Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email or Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your email or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <input
                type="checkbox"
                className="form-check-input me-2"
                id="rememberMe"
              />
              <label
                htmlFor="rememberMe"
                className="form-check-label small text-muted"
              >
                Remember me
              </label>
            </div>
            <a href="#" className="small text-decoration-none text-primary">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 text-muted">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-primary text-decoration-none fw-semibold"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
