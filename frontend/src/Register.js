import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyTokenRequest } from "./services/api";
import "./Register.css";

/////////////////////////////
// Register Component
/////////////////////////////
const Register = () => {
  const navigate = useNavigate();

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  /////////////////////////////
  // Handle Registration
  /////////////////////////////
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !address) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password, address }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.errorMessage || "Registration failed");
        return;
      }

      navigate("/", { state: { message: "Registration Done!" } });

    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2>Library Register</h2>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
            {error}
          </p>
        )}

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

        <button className="btn-register" onClick={handleRegister}>
          Register
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/">Log In</Link>
        </p>
      </div>
    </div>
  );
};

/////////////////////////////
// Export Register
/////////////////////////////
export default Register;
