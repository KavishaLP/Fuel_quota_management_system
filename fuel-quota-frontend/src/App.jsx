//npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
//npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLogin from "./pages/userLogin/UserLogin";
import RegisterForm from "./pages/userVehicleregistration/VehicleRegistration";
import "./App.css";
import LandingPage from "./pages/landingpage/LandingPage";
import AuthenticatedDashboard from "./pages/dashboard/Dashboard";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-register" element={<RegisterForm />} />
        <Route path="/user-dashboard" element={
            <AuthenticatedDashboard/>
        } />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
