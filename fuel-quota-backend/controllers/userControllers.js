import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { vehicleDB, motorTrafficDB } from "../config/sqldb.js";
import { console } from "inspector/promises";



export const loginUser = async (req, res) => {
    console.log("Login request received:", req.body);
    const { vehicleNumber, password } = req.body;

    // Validate required fields
    if (!vehicleNumber || !password) {
        console.log("Missing fields:", { vehicleNumber, password });
        return res.status(400).json({
            success: false,
            message: "Vehicle Number and password are required",
            errorType: "VALIDATION_ERROR",
            errors: {
                vehicleNumber: !vehicleNumber ? "Vehicle Number is required" : null,
                password: !password ? "Password is required" : null
            }
        });
    }

    try {
        // Check if user with the provided vehicle number exists
        const query = "SELECT * FROM vehicleowner WHERE vehicleNumber = ?";
        vehicleDB.query(query, [vehicleNumber], async (err, results) => {
            if (err) {
                console.error("Database error during login:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    errorType: "DATABASE_ERROR"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid vehicle number or password",
                    errorType: "AUTHENTICATION_ERROR"
                });
            }

            const user = results[0];
            
            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid vehicle number or password",
                    errorType: "AUTHENTICATION_ERROR"
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, vehicleNumber: user.vehicleNumber },
                process.env.JWT_SECRET || 'fallback_secret_key_not_for_production',
                { expiresIn: '24h' }
            );
            console.log("Generated token:", token);

            // Return user data (excluding password)
            const userData = { ...user };
            delete userData.password;

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: userData
            });
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            errorType: "SERVER_ERROR"
        });
    }
};

export const getVehicleTypes = async (req, res) => {
    try {
        const query = "SELECT id, type_name FROM vehicle_types";
        vehicleDB.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching vehicle types:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error when fetching vehicle types",
                    errorType: "DATABASE_ERROR"
                });
            }
            
            return res.status(200).json({
                success: true,
                message: "Vehicle types retrieved successfully",
                data: results
            });
        });
    } catch (error) {
        console.error("Unexpected error fetching vehicle types:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            errorType: "SERVER_ERROR"
        });
    }
};


