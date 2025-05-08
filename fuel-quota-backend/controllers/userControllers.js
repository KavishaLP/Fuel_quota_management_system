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
        // Step 1: Verify vehicle exists in motor traffic database
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

                if (existingResults.length > 0) {
                    const errors = {};
                    errors.vehicleNumber = "This vehicle is already registered";
                    
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
                    // Step 3: Get vehicle type details for quota
                    const vehicleTypeQuery = `
                        SELECT weekly_quota FROM vehicle_types 
                        WHERE id = ?
                    `;
                    
                    vehicleDB.query(vehicleTypeQuery, [vehicleType], 
                    async (typeErr, typeResults) => {
                        if (typeErr || typeResults.length === 0) {
                            console.error("Vehicle type error:", typeErr);
                            return res.status(400).json({
                                success: false,
                                message: "Invalid vehicle type specified",
                                errorType: "VALIDATION_ERROR",
                                errors: {
                                    vehicleType: "Please select a valid vehicle type"
                                }
                            });
                        }

                        const weeklyQuota = typeResults[0].weekly_quota;
                        const uniqueToken = crypto.randomBytes(32).toString('hex');
                        const hashedPassword = await bcrypt.hash(password, 12);
                        const vehicleTypeId = parseInt(vehicleType, 10);

                        if (isNaN(vehicleTypeId)) {
                            return res.status(400).json({
                                success: false,
                                message: "Invalid vehicle type",
                                errorType: "VALIDATION_ERROR",
                                errors: {
                                    vehicleType: "Please select a valid vehicle type"
                                }
                            });
                        }

                        // Start transaction for atomic operations
                        vehicleDB.beginTransaction(async (transactionErr) => {
                            if (transactionErr) {
                                console.error("Transaction error:", transactionErr);
                                return res.status(500).json({
                                    success: false,
                                    message: "Transaction initialization failed",
                                    errorType: "DATABASE_ERROR"
                                });
                            }

                            try {
                                // Step 4: Register vehicle owner
                                const registrationQuery = `
                                    INSERT INTO vehicleowner (
                                        firstName, lastName, NIC, vehicleType,
                                        vehicleNumber, engineNumber, password, uniqueToken
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                `;
                                
                                vehicleDB.query(registrationQuery, [
                                    firstName, lastName, NIC, vehicleTypeId,
                                    vehicleNumber, engineNumber, hashedPassword, uniqueToken
                                ], async (registrationErr, registrationResult) => {
                                    if (registrationErr) {
                                        return vehicleDB.rollback(() => {
                                            console.error("Registration error:", registrationErr);
                                            res.status(500).json({
                                                success: false,
                                                message: "Registration processing error",
                                                errorType: "REGISTRATION_ERROR"
                                            });
                                        });
                                    }

                                    const ownerId = registrationResult.insertId;
                                    const currentDate = new Date();
                                    const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
                                    const weekEnd = new Date(weekStart);
                                    weekEnd.setDate(weekStart.getDate() + 6);

                                    // Step 5: Initialize fuel quota
                                    const quotaQuery = `
                                        INSERT INTO fuel_quotas (
                                            vehicle_owner_id, vehicle_type_id, 
                                            remaining_quota, week_start_date, week_end_date
                                        ) VALUES (?, ?, ?, ?, ?)
                                    `;
                                    
                                    vehicleDB.query(quotaQuery, [
                                        ownerId, vehicleTypeId,
                                        weeklyQuota, 
                                        weekStart.toISOString().split('T')[0], 
                                        weekEnd.toISOString().split('T')[0]
                                    ], (quotaErr) => {
                                        if (quotaErr) {
                                            return vehicleDB.rollback(() => {
                                                console.error("Quota initialization error:", quotaErr);
                                                res.status(500).json({
                                                    success: false,
                                                    message: "Fuel quota initialization failed",
                                                    errorType: "QUOTA_ERROR"
                                                });
                                            });
                                        }

                                        // Commit transaction if all succeeds
                                        vehicleDB.commit((commitErr) => {
                                            if (commitErr) {
                                                return vehicleDB.rollback(() => {
                                                    console.error("Commit error:", commitErr);
                                                    res.status(500).json({
                                                        success: false,
                                                        message: "Transaction commit failed",
                                                        errorType: "DATABASE_ERROR"
                                                    });
                                                });
                                            }

                                            // Success response
                                            return res.status(201).json({
                                                success: true,
                                                message: "Vehicle registered successfully with fuel quota",
                                                data: {
                                                    registrationId: ownerId,
                                                    owner: `${firstName} ${lastName}`,
                                                    vehicleDetails: {
                                                        number: vehicleNumber,
                                                        type: vehicleType,
                                                        engineNumber,
                                                        make: motorTrafficResults[0].make,
                                                        model: motorTrafficResults[0].model,
                                                        year: motorTrafficResults[0].year,
                                                        weeklyQuota: weeklyQuota
                                                    },
                                                    token: uniqueToken
                                                }
                                            });
                                        });
                                    });
                                });
                            } catch (processingError) {
                                vehicleDB.rollback(() => {
                                    console.error("Processing error:", processingError);
                                    res.status(500).json({
                                        success: false,
                                        message: "Registration processing failed",
                                        errorType: "PROCESSING_ERROR"
                                    });
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


