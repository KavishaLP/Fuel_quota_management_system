import React, { useState } from "react";
import axios from "axios";
import "./VehicleRegistration.css";
const RegisterForm = () => {
  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error and success messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validation check for empty fields
    if (!firstName || !lastName ||!nationalIdNumber || !vehicleType || !vehicleNumber || !engineNumber || !password || !rePassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    // Check if passwords match
    if (password !== rePassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    // Validate vehicle and engine numbers (basic alphanumeric validation)
    if (!/^[A-Za-z0-9]+$/.test(vehicleNumber) || !/^[A-Za-z0-9]+$/.test(engineNumber)) {
      setErrorMessage("Vehicle number and engine number must be alphanumeric.");
      return;
    }

    try {
      // Send the form data to the backend API
      const response = await axios.post("http://localhost:5000/api/register", {
        firstName,
        lastName,
        nationalIdNumber,
        vehicleType,
        vehicleNumber,
        engineNumber,
        password,
        confirmPassword: rePassword,
      });

      // Show success message
      setSuccessMessage(response.data.message);
    } catch (error) {
      // Handle error response
      setErrorMessage(error.response?.data?.message || "An error occurred during registration.");
    }
  };

  return (
    <div className="container">
      <h2>Register Vehicle</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="NIC Number"
          value={nationalIdNumber}
          onChange={(e) => setNationalIdNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Vehicle Type"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Engine Number"
          value={engineNumber}
          onChange={(e) => setEngineNumber(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
        />

        {/* Display error or success messages */}
        {errorMessage && <div className="error">{errorMessage}</div>}
        {successMessage && <div className="success">{successMessage}</div>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
