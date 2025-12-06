import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile/Profile";
import HomePage from "./HomePage/HomePage";
import Admin from "./Admin/Admin";
import "./App.css";

/////////////////////////////
// App Component & Routes
/////////////////////////////
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

/////////////////////////////
// Export App
/////////////////////////////
export default App;
