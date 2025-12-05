import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifyTokenRequest } from "./services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const loc = useLocation();
  const message = loc.state?.message; 

    // ------------------- START AUTHENTICATION CHECK -------------------
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return; // no token, user stays on login/register
  
      async function verifyToken() {
        try {
          const data = await verifyTokenRequest(token);
          
            // token valid → redirect to homepage
            if (data.member) {
              navigate("/homepage");
            }
          } catch (err) {
            // token invalid → clear it & allow user to access login/register
            console.error("Token verification failed:", err);
            localStorage.removeItem("token");
          }
        }
  
      verifyToken();
    }, [navigate]);
    // ------------------- END AUTHENTICATION CHECK -------------------

  // Local state for input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // for showing login errors

  // Handle login form submission
  async function handleLogin(e) {
    e.preventDefault();

    // Clear previous error
    setError("");

    // Frontend validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // --- BACKEND CALL ---
      // Send credentials to Node.js backend API
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        // Show error from backend
        setError(data.errorMessage || "Login failed");
        return;
      }

      // On success, save JWT in localStorage
      localStorage.setItem("token", data.token);

      // Navigate to HomePage after successful login
      navigate("/HomePage");

    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>

        {/* Show message from location state (e.g., after registration) */}
        {message && (
          <p style={{ color: "green", textAlign: "center", marginBottom: "15px" }}>
            {message}
          </p>
        )}

        {/* Show frontend/backend error messages */}
        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        {/* Email input */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password input */}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button className="btn-login" onClick={handleLogin}>
          Login
        </button>

        {/* Link to register page */}
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;