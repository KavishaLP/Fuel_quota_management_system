//npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
//npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import UserLogin from "./pages/userLogin/UserLogin";
import RegisterForm from "./pages/userVehicleregistration/VehicleRegistration";
import LandingPage from "./pages/landingpage/LandingPage";
import AuthenticatedDashboard from "./pages/dashboard/Dashboard";

import ShedOwnerRegister from "./pages/shedOwnerRegister/shedOwnerRegister";
import ShedOwnerLogin from "./pages/shedOwnerLogin/shedOwnerLogin";
import AuthenticatedshedOwnerDashboard from "./pages/shedOwnerDashboard/shedOwnerDashboard";
//add npm new
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-register" element={<RegisterForm />} />
        <Route path="/shed-owner-register" element={<ShedOwnerRegister />} />
        <Route path="/shed-owner-login" element={<ShedOwnerLogin />} />
        <Route path="/user-vehicle-registration" element={<RegisterForm />} />

        <Route path="/user-dashboard" element={
            <AuthenticatedDashboard/>
        } />


        <Route path="/shed-owner-dashboard" element={
            <AuthenticatedshedOwnerDashboard/>
        } />        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
