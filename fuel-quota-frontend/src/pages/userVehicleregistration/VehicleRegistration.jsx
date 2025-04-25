import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VehicleRegistration.css";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

const RegisterForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    NIC: "",
    vehicleType: "",
    vehicleNumber: "",
    engineNumber: "",
    password: "",
    rePassword: ""
  });

  // UI state
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Remove a toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Field validation
  const validateFields = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = "This field is required";
        isValid = false;
      }
    });

    // NIC validation
    if (formData.NIC && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.NIC)) {
      newErrors.NIC = "Use format: 123456789V or 123456789012";
      isValid = false;
    }

    // Vehicle number validation
    if (formData.vehicleNumber && !/^[A-Z]{2,3}-\d{4}$/.test(formData.vehicleNumber)) {
      newErrors.vehicleNumber = "Format: ABC-1234 (uppercase letters)";
      isValid = false;
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
      isValid = false;
    }

    // Password match validation
    if (formData.password !== formData.rePassword) {
      newErrors.rePassword = "Passwords don't match";
      isValid = false;
    }

    setFieldErrors(newErrors);
    
    if (!isValid) {
      addToast("Please correct the errors in the form", "error");
    }
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateFields()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        NIC: formData.NIC,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        engineNumber: formData.engineNumber,
        password: formData.password,
        confirmPassword: formData.rePassword,
      });

      // Show success toast
      addToast("Vehicle registered successfully!", "success");
      
      // Additional success details
      addToast(`Your vehicle ${formData.vehicleNumber} is now registered`, "success");
      addToast("Please save your token securely", "info");

      // Store token for future use
      localStorage.setItem('authToken', response.data.data.token);

      // Reset form on successful submission
      setFormData({
        firstName: "",
        lastName: "",
        NIC: "",
        vehicleType: "",
        vehicleNumber: "",
        engineNumber: "",
        password: "",
        rePassword: ""
      });

    } catch (err) {
      const apiError = err.response?.data;
      
      if (apiError?.errorType === "MISSING_FIELDS") {
        setFieldErrors(apiError.fields);
        addToast("Please fill in all required fields", "error");
      } 
      else if (apiError?.errorType === "VEHICLE_NOT_FOUND") {
        addToast("Vehicle not found in official records. Please verify details.", "error");
      }
      else if (apiError?.errorType === "OWNER_MISMATCH") {
        addToast("NIC doesn't match official records", "error");
      }
      else if (apiError?.errorType === "ALREADY_REGISTERED") {
        addToast("This vehicle or NIC is already registered", "error");
      }
      else if (apiError?.message) {
        addToast(apiError.message, "error");
      }
      else {
        addToast("Registration failed. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field error
  const renderFieldError = (fieldName) => {
    return fieldErrors[fieldName] ? (
      <span className="field-error">{fieldErrors[fieldName]}</span>
    ) : null;
  };

  return (
    <div className="registration-container">
      {/* Toast container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <h2>Vehicle Registration</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={fieldErrors.firstName ? "error" : ""}
          />
          {renderFieldError("firstName")}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={fieldErrors.lastName ? "error" : ""}
          />
          {renderFieldError("lastName")}
        </div>

        <div className="form-group">
          <label>NIC Number</label>
          <input
            type="text"
            name="NIC"
            value={formData.NIC}
            onChange={handleChange}
            placeholder="123456789V or 123456789012"
            className={fieldErrors.NIC ? "error" : ""}
          />
          {renderFieldError("NIC")}
        </div>

        <div className="form-group">
          <label>Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className={fieldErrors.vehicleType ? "error" : ""}
          >
            <option value="">Select vehicle type</option>
            <option value="Car">Car</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Lorry">Lorry</option>
            <option value="Other">Other</option>
          </select>
          {renderFieldError("vehicleType")}
        </div>

        <div className="form-group">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            placeholder="ABC-1234"
            className={fieldErrors.vehicleNumber ? "error" : ""}
          />
          {renderFieldError("vehicleNumber")}
        </div>

        <div className="form-group">
          <label>Engine Number</label>
          <input
            type="text"
            name="engineNumber"
            value={formData.engineNumber}
            onChange={handleChange}
            className={fieldErrors.engineNumber ? "error" : ""}
          />
          {renderFieldError("engineNumber")}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={fieldErrors.password ? "error" : ""}
          />
          {renderFieldError("password")}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="rePassword"
            value={formData.rePassword}
            onChange={handleChange}
            className={fieldErrors.rePassword ? "error" : ""}
          />
          {renderFieldError("rePassword")}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Registering...
            </>
          ) : (
            "Register Vehicle"
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;