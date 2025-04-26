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
        return res.status(400).json({
            success: false,
            message: "Invalid vehicle number",
            errorType: "VALIDATION_ERROR",
            errors: {
                vehicleNumber: "Format: ABC-1234 (uppercase letters)"
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

            // Step 2: Check if already registered in our system
            const existingCheckQuery = `
                SELECT * FROM vehicleowner 
                WHERE vehicleNumber = ? 
                OR (NIC = ? AND vehicleNumber != ?)
            `;
            
            vehicleDB.query(existingCheckQuery, [vehicleNumber, NIC, vehicleNumber], 
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
                    const nicExists = existingResults.some(r => r.NIC === NIC && r.vehicleNumber !== vehicleNumber);
                    const vehicleExists = existingResults.some(r => r.vehicleNumber === vehicleNumber);
                    
                    if (nicExists) {
                        errors.NIC = "This NIC is already registered with another vehicle";
                    }
                    if (vehicleExists) {
                        errors.vehicleNumber = "This vehicle is already registered";
                        // Check if it's registered by the same owner
                        const sameOwner = existingResults.some(r => 
                            r.vehicleNumber === vehicleNumber && r.NIC === NIC
                        );
                        if (sameOwner) {
                            errors.general = "You have already registered this vehicle";
                        }
                    }

                    return res.status(409).json({
                        success: false,
                        message: "Duplicate registration detected",
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
                            },
                            nextSteps: [
                                "Save your registration details",
                                "Use your token to generate QR code",
                                "Login to access your fuel quota"
                            ]
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
    console.log("Received login request:", req.body);
    const { NIC, password } = req.body;

    // Validate required fields
    if (!NIC || !password) {
        return res.status(400).json({
            success: false,
            message: "NIC and password are required",
            errorType: "VALIDATION_ERROR",
            errors: {
                NIC: !NIC ? "NIC is required" : null,
                password: !password ? "Password is required" : null
            }
        });
    }

    // Validate NIC format (matches your registration validation)
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

    try {
        // Check if user exists in vehicleowner table
        const userQuery = `
            SELECT * FROM vehicleowner 
            WHERE NIC = ?
        `;
        
        vehicleDB.query(userQuery, [NIC], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error during login",
                    errorType: "DATABASE_ERROR"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                    errorType: "AUTH_ERROR",
                    errors: {
                        NIC: "No account found with this NIC"
                    }
                });
            }

            const user = results[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                    errorType: "AUTH_ERROR",
                    errors: {
                        password: "Incorrect password"
                    }
                });
            }

            // Create JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    NIC: user.NIC,
                    vehicleNumber: user.vehicleNumber
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Get vehicle details from motor traffic DB for additional info
            const vehicleQuery = `
                SELECT make, model, year 
                FROM registered_vehicles
                WHERE vehicleNumber = ?
                LIMIT 1
            `;
            
            motorTrafficDB.query(vehicleQuery, [user.vehicleNumber], (vehicleErr, vehicleResults) => {
                if (vehicleErr) {
                    console.error("Vehicle details error:", vehicleErr);
                    // Continue without vehicle details if there's an error
                    return sendSuccessResponse(user, vehicleResults[0]);
                }

                return sendSuccessResponse(user, vehicleResults[0] || {});
            });

            function sendSuccessResponse(user, vehicleDetails) {
                // Successful login response
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        NIC: user.NIC,
                        vehicleNumber: user.vehicleNumber,
                        vehicleType: user.vehicleType,
                        engineNumber: user.engineNumber,
                        vehicleDetails: {
                            make: vehicleDetails.make,
                            model: vehicleDetails.model,
                            year: vehicleDetails.year
                        }
                    },
                    nextSteps: [
                        "Use your token to authenticate requests",
                        "Token expires in 1 hour"
                    ]
                });
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during login",
            errorType: "SERVER_ERROR"
        });
    }
};