import React, { useState } from "react";
import withAuth2 from "../withAuth2";
import "./shedOwnerDashboard.css";

const ShedOwnerDashboard = ({ userId, authToken }) => {
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegisterEmployee = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/shedownerapi/register-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          station_registration_number: userId,
          name: employeeName,
          email: employeeEmail,
          password: password,
        }),
      });

      if (response.ok) {
        setMessage("Employee registered successfully!");
        setEmployeeName("");
        setEmployeeEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to register employee.");
      }
    } catch (error) {
      setMessage("An error occurred while registering the employee.");
    }
  };

  return (
    <div className="shed-owner-dashboard">
      <h1>Shed Owner Dashboard</h1>
      <form onSubmit={handleRegisterEmployee} className="employee-form">
        <h2>Register Employee</h2>
        <div>
          <label htmlFor="employeeName">Employee Name:</label>
          <input
            type="text"
            id="employeeName"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="employeeEmail">Employee Email:</label>
          <input
            type="email"
            id="employeeEmail"
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register Employee</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

const AuthenticatedshedOwnerDashboard = withAuth2(ShedOwnerDashboard);
export default AuthenticatedshedOwnerDashboard;
