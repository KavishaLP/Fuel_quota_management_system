import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import Toast from "./Toast"; // Reuse your existing Toast component

const UserLogin = () => {
    const [loginData, setLoginData] = useState({
        NIC: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);
    const navigate = useNavigate();

    const addToast = (message, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!loginData.NIC) newErrors.NIC = "NIC is required";
        if (!loginData.password) newErrors.password = "Password is required";

        // NIC format validation (matches your registration validation)
        if (loginData.NIC && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(loginData.NIC)) {
            newErrors.NIC = "Valid formats: 123456789V or 123456789012";
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
                NIC: loginData.NIC,
                password: loginData.password
            });

            if (response.data.success) {
                // Clear any existing errors
                setErrors({});
                
                // Store the token and user data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                
                // Show success message
                addToast("Login successful! Redirecting...", "success");
                
                // Redirect after a short delay
                setTimeout(() => {
                    navigate("/dashboard"); // Or your desired route
                }, 1500);
            } else {
                addToast(response.data.message || "Login failed", "error");
            }

        } catch (error) {
            console.error("Login error:", error);
            
            if (error.response) {
                const apiError = error.response.data;
                
                if (apiError.errors) {
                    setErrors(apiError.errors);
                    
                    if (apiError.message) {
                        addToast(apiError.message, "error");
                    }
                    
                    if (apiError.errors.general) {
                        addToast(apiError.errors.general, "error");
                    }
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

            <form onSubmit={handleSubmit} noValidate>
                <div className={`form-group ${errors.NIC ? "has-error" : ""}`}>
                    <label htmlFor="NIC">NIC Number</label>
                    <input
                        type="text"
                        id="NIC"
                        name="NIC"
                        value={loginData.NIC}
                        onChange={handleChange}
                        placeholder="123456789V or 123456789012"
                        required
                    />
                    {errors.NIC && (
                        <span className="field-error">{errors.NIC}</span>
                    )}
                </div>

                <div className={`form-group ${errors.password ? "has-error" : ""}`}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.password && (
                        <span className="field-error">{errors.password}</span>
                    )}
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="submit-btn"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner" aria-hidden="true"></span>
                                Logging in...
                            </>
                        ) : "Login"}
                    </button>
                </div>

                <div className="form-footer">
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                    <p><a href="/forgot-password">Forgot password?</a></p>
                </div>
            </form>
        </div>
    );
};

export default UserLogin;