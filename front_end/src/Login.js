import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';

const API_URL = "http://localhost:5001/api"; // Used to connect to back end.

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }
    
    console.log("Login with:", loginData); 
    
    try{
      const res = await axios.post(`${API_URL}/login`, loginData);
      const user = res.data.user;

      alert(res.data.message);
      if (user.is_admin === 1){
        alert("Redirecting to Admin Page.");
        navigate("/Admin");}
      else{
      navigate("/HomePage");}
      } catch(err){
       console.log("Error message:", err.message); // Log message
      alert(err.response?.data?.message || "Login Failed.") 
    }
    
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
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter email" />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter password" />
        </div>
        <button className="btn-login" onClick={handleLogin}>
          Login
        </button>
        <p className="auth-switch">
        Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  </>);
}



export default Login;
