import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
function Login() {
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    // Fake success login
    navigate("/HomePage");
    
  }
  const loc = useLocation();               // rename from 'location' to 'loc'
  const message = loc.state?.message;      // read message safely
  return (
    <>
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        {message && (
          <p style={{ color: "green", textAlign: "center", marginBottom: "15px" }}>
            {message}
          </p>
        )}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter username" />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter password" />
        </div>

        <button className="btn-login" onClick={handleLogin}>
          Login
        </button>
        <p className="auth-switch">
        Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  </>);
}



export default Login;
