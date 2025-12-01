import React from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
const Register = () => {
  const navigate = useNavigate();
  const handleRegister = (e) => {
    e.preventDefault();
    // Your implementation goes here

    // Fake registration success
    navigate("/", { state: { message: "Registration Done!" } });
  };
  
  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2>Library Register</h2>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter username" />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter email" />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter password" />
        </div>

        <div className="input-group">
          <label htmlFor="address">Address</label>
          <input type="text" id="address" placeholder="Enter address" />
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

export default Register;
