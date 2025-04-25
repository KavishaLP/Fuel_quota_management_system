import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VehicleRegistration.css";
import { console } from "node:inspector/promises";

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch(type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'info': return 'ℹ';
            default: return '';
        }
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{getIcon()}</span>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose} aria-label="Close">
                &times;
            </button>
        </div>
    );
};

const RegisterForm = () => {
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
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
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

            if (response.data.success) {
                // Clear any existing errors
                setErrors({});
                
                // Show success message
                addToast(response.data.message, "success");
                
                // Show info messages for next steps
                response.data.nextSteps.forEach(step => {
                    addToast(step, "info");
                });

                // Reset form
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

                // Store token
                localStorage.setItem('authToken', response.data.data.token);
            } else {
                // Handle unexpected success:false responses
                addToast(response.data.message || "Registration failed", "error");
            }

        } catch (error) {
          console.error("Registration error:", error);
            console.error("Registration error:", error);
            
            if (error.response) {
                const apiError = error.response.data;
                
                if (apiError.errors) {
                    setErrors(apiError.errors);
                    
                    // Show the main error message
                    if (apiError.message) {
                        addToast(apiError.message, "error");
                    }
                    
                    // If there's a general error, show that too
                    if (apiError.errors.general) {
                        addToast(apiError.errors.general, "error");
                    }
                } else if (apiError.message) {
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

            <form onSubmit={handleSubmit} noValidate>
                {[
                    { name: "firstName", label: "First Name", type: "text" },
                    { name: "lastName", label: "Last Name", type: "text" },
                    { name: "NIC", label: "NIC Number", type: "text", placeholder: "123456789V or 123456789012" },
                    { 
                        name: "vehicleType", 
                        label: "Vehicle Type", 
                        type: "select",
                        options: ["", "Car", "Motorcycle", "Van", "Bus", "Lorry", "Other"]
                    },
                    { name: "vehicleNumber", label: "Vehicle Number", type: "text", placeholder: "ABC-1234" },
                    { name: "engineNumber", label: "Engine Number", type: "text" },
                    { name: "password", label: "Password", type: "password" },
                    { name: "rePassword", label: "Confirm Password", type: "password" }
                ].map(field => (
                    <div key={field.name} className={`form-group ${errors[field.name] ? "has-error" : ""}`}>
                        <label htmlFor={field.name}>{field.label}</label>
                        
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
                    ) : "Register Vehicle"}
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;