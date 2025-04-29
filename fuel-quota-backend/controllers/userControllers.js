import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { vehicleDB, motorTrafficDB } from "../config/sqldb.js";
import { console } from "inspector/promises";

export const registerVehicle = async (req, res) => {
    console.log("Received registration request:", req.body);
    const { 
        firstName, 
        lastName, 
        NIC, 
        vehicleType,
        vehicleNumber, 
        engineNumber, 
        password, 
        confirmPassword 
    } = req.body;

    // Validate required fields
    const requiredFields = {
        firstName: "First name is required",
        lastName: "Last name is required",
        NIC: "NIC is required",
        vehicleType: "Vehicle type is required",
        vehicleNumber: "Vehicle number is required",
        engineNumber: "Engine number is required",
        password: "Password is required",
        confirmPassword: "Please confirm your password"
    };
    
    const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !req.body[field])
        .reduce((acc, [field, message]) => {
            acc[field] = message;
            return acc;
        }, {});

    if (Object.keys(missingFields).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields",
            errorType: "VALIDATION_ERROR",
            errors: missingFields
        });
    }

    // Validate password match
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password confirmation doesn't match",
            errorType: "VALIDATION_ERROR",
            errors: {
                confirmPassword: "Passwords do not match"
            }
        });
    }

    // Validate NIC format (Sri Lankan NIC)
    if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(NIC)) {
        return res.status(400).json({
            success: false,
            message: "Invalid NIC format",
            errorType: "VALIDATION_ERROR",
            errors: {
                NIC: "Valid formats: 123456789V or 123456789012"
            }
        });
    }

    // Validate vehicle number format (Sri Lankan format)
    if (!/^[A-Z]{2,3}-\d{4}$/.test(vehicleNumber)) {
        console.log("Invalid Vehicle Number format:", vehicleNumber);
        return res.status(400).json({
            success: false,
            message: "Invalid Vehicle Number format",
            errorType: "VALIDATION_ERROR",
            errors: {
                vehicleNumber: "Format: ABC-1234 (uppercase)"
            }
        });
    }

    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password is too weak",
            errorType: "VALIDATION_ERROR",
            errors: {
                password: "Password must be at least 8 characters"
            }
        });
    }

    try {
        // Step 1: Verify vehicle exists in motor traffic database with matching details
        const motorTrafficCheckQuery = `
            SELECT * FROM registered_vehicles 
            WHERE vehicleNumber = ? 
            AND engineNumber = ? 
            AND ownerNIC = ?
            AND isActive = TRUE
        `;
        
        motorTrafficDB.query(motorTrafficCheckQuery, [vehicleNumber, engineNumber, NIC], 
        async (motorTrafficErr, motorTrafficResults) => {
            if (motorTrafficErr) {
                console.error("Motor traffic DB error:", motorTrafficErr);
                return res.status(500).json({
                    success: false,
                    message: "Database connection error",
                    errorType: "DATABASE_ERROR"
                });
            }

            if (motorTrafficResults.length === 0) {
                // Additional check to see which field doesn't match
                const verificationErrors = {};
                const partialCheckQuery = `
                    SELECT * FROM registered_vehicles 
                    WHERE vehicleNumber = ? OR engineNumber = ? OR ownerNIC = ?
                `;
                
                motorTrafficDB.query(partialCheckQuery, [vehicleNumber, engineNumber, NIC], 
                (partialErr, partialResults) => {
                    if (partialErr) {
                        console.error("Partial verification error:", partialErr);
                        return res.status(404).json({
                            success: false,
                            message: "Vehicle details not found in government database",
                            errorType: "VERIFICATION_FAILED"
                        });
                    }

                    if (partialResults.length > 0) {
                        const record = partialResults[0];
                        if (record.vehicleNumber !== vehicleNumber) {
                            verificationErrors.vehicleNumber = "Vehicle number doesn't match official records";
                        }
                        if (record.engineNumber !== engineNumber) {
                            verificationErrors.engineNumber = "Engine number doesn't match official records";
                        }
                        if (record.ownerNIC !== NIC) {
                            verificationErrors.NIC = "NIC doesn't match registered owner";
                        }
                    } else {
                        verificationErrors.general = "Vehicle not found in government database";
                    }

                    return res.status(404).json({
                        success: false,
                        message: "Vehicle verification failed",
                        errorType: "VERIFICATION_FAILED",
                        errors: verificationErrors
                    });
                });
                return;
            }

            // Step 2: Check if vehicle is already registered in our system
            // Modified to only check if the specific vehicle is already registered
            // (not preventing users from registering multiple vehicles)
            const existingCheckQuery = `
                SELECT * FROM vehicleowner 
                WHERE vehicleNumber = ?
            `;
            
            vehicleDB.query(existingCheckQuery, [vehicleNumber], 
            async (existingErr, existingResults) => {
                if (existingErr) {
                    console.error("Vehicle DB error:", existingErr);
                    return res.status(500).json({
                        success: false,
                        message: "Database connection error",
                        errorType: "DATABASE_ERROR"
                    });
                }

                // Only check if this specific vehicle is already registered
                if (existingResults.length > 0) {
                    const errors = {};
                    errors.vehicleNumber = "This vehicle is already registered";
                    
                    // Check if it's registered by the same owner
                    const sameOwner = existingResults.some(r => 
                        r.vehicleNumber === vehicleNumber && r.NIC === NIC
                    );
                    
                    if (sameOwner) {
                        errors.general = "You have already registered this vehicle";
                    } else {
                        errors.general = "This vehicle is registered by another user";
                    }

                    return res.status(409).json({
                        success: false,
                        message: "Vehicle already registered",
                        errorType: "DUPLICATE_REGISTRATION",
                        errors
                    });
                }

                try {
                    // Step 3: Proceed with registration
                    const uniqueToken = crypto.randomBytes(32).toString('hex');
                    const hashedPassword = await bcrypt.hash(password, 12);
                    
                    const registrationQuery = `
                        INSERT INTO vehicleowner (
                            firstName, lastName, NIC, vehicleType,
                            vehicleNumber, engineNumber, password, uniqueToken
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    vehicleDB.query(registrationQuery, [
                        firstName, lastName, NIC, vehicleType,
                        vehicleNumber, engineNumber, hashedPassword, uniqueToken
                    ], (registrationErr, registrationResult) => {
                        if (registrationErr) {
                            console.error("Registration error:", registrationErr);
                            return res.status(500).json({
                                success: false,
                                message: "Registration processing error",
                                errorType: "REGISTRATION_ERROR"
                            });
                        }

                        // Success response
                        return res.status(201).json({
                            success: true,
                            message: "Vehicle registered successfully",
                            data: {
                                registrationId: registrationResult.insertId,
                                owner: `${firstName} ${lastName}`,
                                vehicleDetails: {
                                    number: vehicleNumber,
                                    type: vehicleType,
                                    engineNumber,
                                    make: motorTrafficResults[0].make,
                                    model: motorTrafficResults[0].model,
                                    year: motorTrafficResults[0].year
                                },
                                token: uniqueToken
                            }
                        });
                    });
                } catch (processingError) {
                    console.error("Processing error:", processingError);
                    return res.status(500).json({
                        success: false,
                        message: "Registration processing failed",
                        errorType: "PROCESSING_ERROR"
                    });
                }
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            errorType: "SERVER_ERROR"
        });
    }
};

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

    // Rest of the function remains unchanged
    // ...
};

