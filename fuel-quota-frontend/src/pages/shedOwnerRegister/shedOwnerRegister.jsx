/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./shedOwnerRegister.css";
import { Toast } from '../Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faEnvelope, 
    faPhone, 
    faKey, 
    faStore, 
    faIdCard, 
    faSignInAlt 
} from '@fortawesome/free-solid-svg-icons';

const ShedOwnerRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        station_registration_number: "",
        owner_name: "",
        contact_number: "",
        email: "",
        password: "",
        confirmPassword: ""
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
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        if (!formData.station_registration_number) newErrors.station_registration_number = "Registration number is required";
        if (!formData.owner_name) newErrors.owner_name = "Owner name is required";
        if (!formData.contact_number) newErrors.contact_number = "Contact number is required";
        if (!formData.email) newErrors.email = "Email address is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";

        // Format validations
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        if (formData.contact_number && !/^(?:\+94|0)[1-9][0-9]{8}$/.test(formData.contact_number)) {
            newErrors.contact_number = "Format: 0XXXXXXXXX or +94XXXXXXXXX";
        }
        
        if (formData.password && formData.password.length < 8) {
            newErrors.password = "Minimum 8 characters required";
        }
        
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
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
            const response = await axios.post("http://localhost:5000/shedapi/shed-register", {
                stationRegistrationNumber: formData.station_registration_number,
                ownerName: formData.owner_name,
                contactNumber: formData.contact_number,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            // Handle successful response
            if (response.data && response.data.success) {
                // Clear form data and errors
                setErrors({});
                setFormData({
                    station_registration_number: "",
                    owner_name: "",
                    contact_number: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                
                // Show success message
                addToast("Fuel Station registered successfully! Redirecting to login...", "success");
                
                // Redirect to login page
                setTimeout(() => {
                    navigate('/shed-owner-login');
                }, 2500);
                
                return;
            } else {
                addToast(response.data?.message || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            
            if (error.response) {
                const apiError = error.response.data;
                
                if (apiError?.errors) {
                    setErrors(apiError.errors);
                    
                    if (apiError.message) {
                        addToast(apiError.message, "error");
                    }
                    
                    if (apiError.errors?.general) {
                        addToast(apiError.errors.general, "error");
                    }
                } else if (apiError?.message) {
                    addToast(apiError.message, "error");
                }
            } else if (error.request) {
                addToast("No response from server. Please try again.", "error");
            } else {
                addToast("Registration failed. Please try again.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form field configuration
    const formFields = [
        { 
            name: "station_registration_number", 
            label: "Station Registration Number", 
            type: "text", 
            icon: faIdCard,
            placeholder: "Enter station registration number"
        },
        { 
            name: "owner_name", 
            label: "Owner Name", 
            type: "text", 
            icon: faUser 
        },
        { 
            name: "contact_number", 
            label: "Contact Number", 
            type: "text", 
            icon: faPhone,
            placeholder: "0XXXXXXXXX or +94XXXXXXXXX"
        },
        { 
            name: "email", 
            label: "Email Address", 
            type: "email", 
            icon: faEnvelope 
        },
        { 
            name: "password", 
            label: "Password", 
            type: "password", 
            icon: faKey 
        },
        { 
            name: "confirmPassword", 
            label: "Confirm Password", 
            type: "password", 
            icon: faKey 
        }
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

            <h2><FontAwesomeIcon icon={faStore} /> Fuel Station Registration</h2>

            <form onSubmit={handleSubmit} className="registration-form" noValidate>
                {formFields.map(field => (
                    <div key={field.name} className={`form-group ${errors[field.name] ? "has-error" : ""}`}>
                        <label htmlFor={field.name}>
                            <FontAwesomeIcon icon={field.icon} />
                            {field.label}
                        </label>
                        <input
                            id={field.name}
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder || ""}
                            required
                        />
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
                            <FontAwesomeIcon icon={faStore} />
                            Register Fuel Station
                        </>
                    )}
                </button>

                <div className="form-footer">
                    <p>
                        Already have an account? 
                        <a href="/shed-owner-login">
                            <FontAwesomeIcon icon={faSignInAlt} /> Login here
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ShedOwnerRegister;