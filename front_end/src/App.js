import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Profile from "./Profile/Profile";
import HomePage from "./HomePage/HomePage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
// LIST OF CHANGES MADE SO FAR:
// 1. HomePage.js : removed sign-up and changed login to logout.
// 2. SignUp.js : Connected to the backend fake registration removed.
// 3. Login.js : Connect to the back end fake registration removed and 
// changed entry from username to email. TODO: isadmin check.

export default App;
