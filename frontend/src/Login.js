import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifyTokenRequest } from "./services/api";
import "./Login.css";

/////////////////////////////
// Login Component
/////////////////////////////
function Login() {
  const navigate = useNavigate();
  const loc = useLocation();
  const message = loc.state?.message; 

  /////////////////////////////
  // Authentication Check
  /////////////////////////////
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function verifyToken() {
      try {
        const data = await verifyTokenRequest(token);

        if (data.member) navigate("/homepage");
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
      }
    }

    verifyToken();
  }, [navigate]);

  /////////////////////////////
  // Local State
  /////////////////////////////
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /////////////////////////////
  // Handle Login Submission
  /////////////////////////////
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.errorMessage || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/HomePage");

    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  }

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>

        {message && (
          <p style={{ color: "green", textAlign: "center", marginBottom: "15px" }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
            {error}
          </p>
        )}

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

        <button className="btn-login" onClick={handleLogin}>
          Login
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

/////////////////////////////
// Export Login
/////////////////////////////
export default Login;
