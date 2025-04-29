/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import { Toast } from '../Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarSide, faKey, faSignInAlt, faUserPlus, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const UserLogin = () => {
    const [loginData, setLoginData] = useState({
        vehicleNumber: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);
    const navigate = useNavigate();

    const addToast = (message, type = "info") => {
        const id = Date.now() + Math.random().toString(36).substr(2, 5); 
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Convert vehicle number to uppercase for consistency
        const processedValue = name === "vehicleNumber" ? value.toUpperCase() : value;
        
        setLoginData(prev => ({ 
            ...prev, 
            [name]: processedValue 
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!loginData.vehicleNumber) newErrors.vehicleNumber = "Vehicle Number is required";
        if (!loginData.password) newErrors.password = "Password is required";

        if (loginData.vehicleNumber && !/^[A-Z]{2,3}-\d{4}$/.test(loginData.vehicleNumber)) {
            newErrors.vehicleNumber = "Format: ABC-1234 (uppercase)";
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
            const response = await axios.post("http://localhost:5000/api/login", {
                vehicleNumber: loginData.vehicleNumber,
                password: loginData.password
            });

            console.log("API Response:", response.data);

            if (response.data.success) {
                setErrors({});
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                addToast("Login successful! Redirecting...", "success");
                setTimeout(() => navigate("/user-dashboard"), 1500);
            } else {
                addToast(response.data.message || "Login failed", "error");
            }
        } catch (error) {
            console.error("Login error:", error);
            
            if (error.response) {
                console.error("Error response data:", error.response.data);
                const apiError = error.response.data;
                
                if (apiError.errors) {
                    setErrors(apiError.errors);
                    if (apiError.message) addToast(apiError.message, "error");
                    if (apiError.errors.general) addToast(apiError.errors.general, "error");
                } else if (apiError.message) {
                    addToast(apiError.message, "error");
                }
            } else if (error.request) {
                addToast("No response from server. Please try again.", "error");
            } else {
                addToast("Login failed. Please try again.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
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

            <h2>Vehicle Owner Login</h2>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
                {/* Vehicle Number Field (replacing NIC) */}
                <div className={`form-group ${errors.vehicleNumber ? "has-error" : ""}`}>
                    <label htmlFor="vehicleNumber">
                        <FontAwesomeIcon icon={faCarSide} style={{ marginRight: '8px' }} />
                        Vehicle Number
                    </label>
                    <input
                        type="text"
                        id="vehicleNumber"
                        name="vehicleNumber"
                        value={loginData.vehicleNumber}
                        onChange={handleChange}
                        placeholder="ABC-1234"
                        required
                    />
                    {errors.vehicleNumber && <span className="field-error">{errors.vehicleNumber}</span>}
                </div>

                {/* Password Field */}
                <div className={`form-group ${errors.password ? "has-error" : ""}`}>
                    <label htmlFor="password">
                        <FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} />
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                {/* Login Button */}
                <button 
                    type="submit" 
                    className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner"></span>
                            Logging in...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSignInAlt} />
                            Login
                        </>
                    )}
                </button>

                {/* Footer Links */}
                <div className="form-footer">
                    <p>
                        <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '6px' }} />
                        Don't have an account? <a href="/user-register">Register here</a>
                    </p>
                    <p>
                        <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: '6px' }} />
                        <a href="/forgot-password">Forgot password?</a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default UserLogin;