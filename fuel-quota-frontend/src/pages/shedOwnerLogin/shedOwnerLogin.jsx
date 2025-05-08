/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./shedOwnerLogin.css";
import { Toast } from '../Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faKey, faSignInAlt, faUserPlus, faQuestionCircle, faIdCard } from '@fortawesome/free-solid-svg-icons';

const ShedOwnerLogin = () => {
    const [loginData, setLoginData] = useState({
        station_registration_number: "",
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
        
        setLoginData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!loginData.station_registration_number) newErrors.station_registration_number = "Station Registration Number is required";
        if (!loginData.password) newErrors.password = "Password is required";

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
            const response = await axios.post("http://localhost:5000/shedapi/shed-login", {
                stationRegistrationNumber: loginData.station_registration_number,
                password: loginData.password
            });
    
            console.log("Full API Response:", response);
    
            if (response.data && response.data.success) {
                // Clear any previous errors
                setErrors({});
                
                // Store token and shed owner data
                localStorage.setItem('shedToken', response.data.token);
                
                // Verify storage immediately
                console.log("Stored token:", localStorage.getItem('shedToken'));
    
                addToast("Login successful! Redirecting...", "success");
                
                setTimeout(() => {
                    navigate("/shed-owner-dashboard");
                }, 1500);
            } else {
                console.error("Unexpected response structure:", response.data);
                addToast(response.data?.message || "Login failed: Unexpected response", "error");
            }
        }
        catch (error) {
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

            <h2><FontAwesomeIcon icon={faStore} className="title-icon" /> Fuel Station Login</h2>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
                {/* Station Registration Number Field */}
                <div className={`form-group ${errors.station_registration_number ? "has-error" : ""}`}>
                    <label htmlFor="station_registration_number">
                        <FontAwesomeIcon icon={faIdCard} style={{ marginRight: '8px' }} />
                        Station Registration Number
                    </label>
                    <input
                        type="text"
                        id="station_registration_number"
                        name="station_registration_number"
                        value={loginData.station_registration_number}
                        onChange={handleChange}
                        placeholder="Enter station registration number"
                        required
                    />
                    {errors.station_registration_number && <span className="field-error">{errors.station_registration_number}</span>}
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
                        Don't have an account? <a href="/shed-owner-register">Register here</a>
                    </p>
                    <p>
                        <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: '6px' }} />
                        <a href="/shed-owner-forgot-password">Forgot password?</a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ShedOwnerLogin;