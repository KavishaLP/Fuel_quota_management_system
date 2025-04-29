/* eslint-disable no-unused-vars */


import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./VehicleRegistration.css";
import { Toast } from '../Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faCar, faKey, faCarSide, faFingerprint, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const RegisterForm = () => {
    const navigate = useNavigate();
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

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info") => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Auto-capitalize vehicle number for better UX
        const processedValue = name === "vehicleNumber" ? value.toUpperCase() : value;
        
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        if (!formData.firstName) newErrors.firstName = "First name is required";
        if (!formData.lastName) newErrors.lastName = "Last name is required";
        if (!formData.NIC) newErrors.NIC = "NIC is required";
        if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required";
        if (!formData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required";
        if (!formData.engineNumber) newErrors.engineNumber = "Engine number is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (!formData.rePassword) newErrors.rePassword = "Please confirm password";

        // Format validations
        if (formData.NIC && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.NIC)) {
            newErrors.NIC = "Valid formats: 123456789V or 123456789012";
        }
        
        if (formData.vehicleNumber && !/^[A-Z]{2,3}-\d{4}$/.test(formData.vehicleNumber)) {
            newErrors.vehicleNumber = "Format: ABC-1234 (uppercase)";
        }
        
        if (formData.password && formData.password.length < 8) {
            newErrors.password = "Minimum 8 characters";
        }
        
        if (formData.password && formData.rePassword && formData.password !== formData.rePassword) {
            newErrors.rePassword = "Passwords don't match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            addToast("Please fix the errors in the form", "error");
            return;
        }

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
                confirmPassword: formData.rePassword
            });

            console.log("Registration response:", response.data);

            // Handle successful response
            if (response.data && response.data.success) {
                // Clear form data and errors
                setErrors({});
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
                
                // Show success message
                addToast("Vehicle registered successfully! Redirecting to login...", "success");
                
                // Use window.location for reliable navigation if React Router is problematic
                setTimeout(() => {
                    window.location.href = '/user-login';
                }, 2500);
                
                return; // Exit early to avoid further processing
            } else {
                // Handle unexpected success format
                addToast(response.data?.message || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            
            // Handle API error responses
            if (error.response) {
                const apiError = error.response.data;
                
                // Handle validation errors
                if (apiError?.errors) {
                    setErrors(apiError.errors);
                    
                    if (apiError.message) {
                        addToast(apiError.message, "error");
                    }
                    
                    if (apiError.errors?.general) {
                        addToast(apiError.errors.general, "error");
                    }
                } else if (apiError?.message) {
                    // Handle general error message
                    addToast(apiError.message, "error");
                }
            } else if (error.request) {
                // Handle no response from server
                addToast("No response from server. Please try again.", "error");
            } else {
                // Handle unexpected errors
                addToast("Registration failed. Please try again.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form field configuration
    const formFields = [
        { name: "firstName", label: "First Name", type: "text", icon: faUser },
        { name: "lastName", label: "Last Name", type: "text", icon: faUser },
        { name: "NIC", label: "NIC Number", type: "text", placeholder: "123456789V or 123456789012", icon: faIdCard },
        { 
            name: "vehicleType", 
            label: "Vehicle Type", 
            type: "select",
            options: ["", "Car", "Motorcycle", "Van", "Bus", "Lorry", "Other"],
            icon: faCar
        },
        { name: "vehicleNumber", label: "Vehicle Number", type: "text", placeholder: "ABC-1234", icon: faCarSide },
        { name: "engineNumber", label: "Engine Number", type: "text", icon: faFingerprint },
        { name: "password", label: "Password", type: "password", icon: faKey },
        { name: "rePassword", label: "Confirm Password", type: "password", icon: faKey }
    ];

    return (
        <div className="registration-container">
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            <h2>Vehicle Registration</h2>

            <form onSubmit={handleSubmit} className="registration-form" noValidate>
                {formFields.map(field => (
                    <div key={field.name} className={`form-group ${errors[field.name] ? "has-error" : ""}`}>
                        <label htmlFor={field.name}>
                            <FontAwesomeIcon icon={field.icon} />
                            {field.label}
                        </label>
                        
                        {field.type === "select" ? (
                            <select
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                            >
                                {field.options.map(option => (
                                    <option key={option} value={option}>
                                        {option || `Select ${field.label.toLowerCase()}`}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                id={field.name}
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder || ""}
                                required
                            />
                        )}
                        
                        {errors[field.name] && (
                            <span className="field-error">{errors[field.name]}</span>
                        )}
                    </div>
                ))}

                {errors.general && (
                    <div className="form-error-message">
                        {errors.general}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faCar} />
                            Register Vehicle
                        </>
                    )}
                </button>

                <div className="form-footer">
                    <p>
                        Already have an account? 
                        <a href="/user-login">
                            <FontAwesomeIcon icon={faSignInAlt} /> Login here
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;