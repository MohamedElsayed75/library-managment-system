import React from "react";
import "./SignUp.css";
import { Link, useNavigate } from "react-router-dom";
const SignUp = () => {
  const navigate = useNavigate();
  const handleSignUp = (e) => {
    e.preventDefault();
    // Your implementation goes here

    // Fake registration success
    navigate("/", { state: { message: "Registration Done!" } });
  };
  
  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2>Library Sign Up</h2>

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

        <button className="btn-signup" onClick={handleSignUp}>
          Sign Up
        </button>
        <p className="auth-switch">
        Already have an account? <Link to="/">Log In</Link>
          </p>
      </div>
    </div>
  );
};

export default SignUp;
