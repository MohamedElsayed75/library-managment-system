import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // Local state for inputs and errors
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError("");

    // Minimal frontend validation
    if (!username || !email || !password || !address) {
      setError("All fields are required.");
      return;
    }

    try {
      // --- BACKEND CALL ---
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          email,
          password,
          address,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // Show error message from backend
        setError(data.errorMessage || "Registration failed");
        return;
      }

      // On success, navigate to login page with success message
      navigate("/", { state: { message: "Registration Done!" } });

    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2>Library Register</h2>

        {/* Show frontend/backend errors */}
        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        {/* Username input */}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Email input */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
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

        {/* Address input */}
        <div className="input-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Register button */}
        <button className="btn-register" onClick={handleRegister}>
          Register
        </button>

        {/* Link to login page */}
        <p className="auth-switch">
          Already have an account? <Link to="/">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;