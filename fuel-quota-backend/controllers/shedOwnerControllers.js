import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { vehicleDB, motorTrafficDB } from "../config/sqldb.js";

export const registerFuelStation = async (req, res) => {
    console.log("Received fuel station registration request:", req.body);
    const {
        stationRegistrationNumber,
        ownerName,
        nicNumber,
        contactNumber,
        email,
        password,
        confirmPassword
    } = req.body;

    // Validate required fields
    const requiredFields = {
        stationRegistrationNumber: "Station registration number is required",
        ownerName: "Owner name is required",
        nicNumber: "NIC number is required",
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
    if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(nicNumber)) {
        return res.status(400).json({
            success: false,
            message: "Invalid NIC format",
            errorType: "VALIDATION_ERROR",
            errors: {
                nicNumber: "Valid formats: 123456789V or 123456789012"
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
        // Step 1: Verify fuel station exists in government database
        const govCheckQuery = `
            SELECT * FROM fuel_sheds 
            WHERE station_registration_number = ? AND nic = ?
        `;

        motorTrafficDB.query(govCheckQuery, [stationRegistrationNumber, nicNumber], 
        async (govErr, govResults) => {
            if (govErr) {
                console.error("Government DB error:", govErr);
                return res.status(500).json({
                    success: false,
                    message: "Government database connection error",
                    errorType: "DATABASE_ERROR"
                });
            }

            if (govResults.length === 0) {
                // Additional check to see which field doesn't match
                const verificationErrors = {};
                const partialCheckQuery = `
                    SELECT * FROM fuel_sheds 
                    WHERE station_registration_number = ? OR nic = ?
                `;
                
                motorTrafficDB.query(partialCheckQuery, [stationRegistrationNumber, nicNumber], 
                (partialErr, partialResults) => {
                    if (partialErr) {
                        console.error("Partial verification error:", partialErr);
                        return res.status(404).json({
                            success: false,
                            message: "Fuel station details not found in government database",
                            errorType: "VERIFICATION_FAILED"
                        });
                    }

                    if (partialResults.length > 0) {
                        const record = partialResults[0];
                        if (record.station_registration_number !== stationRegistrationNumber) {
                            verificationErrors.stationRegistrationNumber = "Registration number doesn't match official records";
                        }
                        if (record.nic !== nicNumber) {
                            verificationErrors.nicNumber = "NIC doesn't match registered owner";
                        }
                    } else {
                        verificationErrors.general = "Fuel station not found in government database";
                    }

                    return res.status(404).json({
                        success: false,
                        message: "Fuel station verification failed",
                        errorType: "VERIFICATION_FAILED",
                        errors: verificationErrors
                    });
                });
                return;
            }

            const govRecord = govResults[0];

            // Step 2: Check if fuel station is already registered in our system
            const existingCheckQuery = `
                SELECT * FROM fuel_stations 
                WHERE station_registration_number = ?
            `;

            vehicleDB.query(existingCheckQuery, [stationRegistrationNumber], 
            async (existingErr, existingResults) => {
                if (existingErr) {
                    console.error("Fuel station DB error:", existingErr);
                    return res.status(500).json({
                        success: false,
                        message: "Database connection error",
                        errorType: "DATABASE_ERROR"
                    });
                }

                if (existingResults.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "This fuel station is already registered",
                        errorType: "DUPLICATE_REGISTRATION",
                        errors: {
                            stationRegistrationNumber: "This registration number is already registered"
                        }
                    });
                }

                try {
                    // Step 3: Determine contact numbers and emails to store
                    let contact_number1 = govRecord.contact_number || null;
                    let contact_number2 = null;
                    let email1 = govRecord.email || null;
                    let email2 = null;

                    // Handle contact numbers
                    if (contactNumber) {
                        if (contact_number1 && contactNumber !== contact_number1) {
                            contact_number2 = contactNumber;
                        } else if (!contact_number1) {
                            contact_number1 = contactNumber;
                        }
                    }

                    // Handle emails
                    if (email) {
                        if (email1 && email !== email1) {
                            email2 = email;
                        } else if (!email1) {
                            email1 = email;
                        }
                    }

                    // Step 4: Proceed with registration
                    const hashedPassword = await bcrypt.hash(password, 12);
                    const currentDate = new Date().toISOString().split('T')[0];

                    const registrationQuery = `
                        INSERT INTO fuel_stations (
                            full_name, nic, contact_number1, contact_number2,
                            email1, email2, fuel_station_name, 
                            station_registration_number, location, registered_date,
                            password
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    vehicleDB.query(registrationQuery, [
                        ownerName,
                        nicNumber,
                        contact_number1,
                        contact_number2,
                        email1,
                        email2,
                        govRecord.fuel_station_name,
                        stationRegistrationNumber,
                        govRecord.location,
                        currentDate,
                        hashedPassword
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
                            message: "Fuel station registered successfully",
                            data: {
                                registrationId: registrationResult.insertId,
                                owner: ownerName,
                                stationDetails: {
                                    name: govRecord.fuel_station_name,
                                    registrationNumber: stationRegistrationNumber,
                                    location: govRecord.location,
                                    contacts: {
                                        primary: contact_number1,
                                        secondary: contact_number2
                                    },
                                    emails: {
                                        primary: email1,
                                        secondary: email2
                                    }
                                }
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

export const loginFuelStation = async (req, res) => {
    console.log("Fuel station login request received:", req.body);
    const { stationRegistrationNumber, password } = req.body;

    // Validate required fields
    if (!stationRegistrationNumber || !password) {
        console.log("Missing fields:", { stationRegistrationNumber, password });
        return res.status(400).json({
            success: false,
            message: "Station registration number and password are required",
            errorType: "VALIDATION_ERROR",
            errors: {
                stationRegistrationNumber: !stationRegistrationNumber ? "Registration number is required" : null,
                password: !password ? "Password is required" : null
            }
        });
    }

    try {
        // Check if station with the provided registration number exists
        const query = "SELECT * FROM fuel_stations WHERE station_registration_number = ?";
        vehicleDB.query(query, [stationRegistrationNumber], async (err, results) => {
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
                    message: "Invalid registration number or password",
                    errorType: "AUTHENTICATION_ERROR"
                });
            }

            const station = results[0];
            
            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, station.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid registration number or password",
                    errorType: "AUTHENTICATION_ERROR"
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: station.id,
                    stationRegistrationNumber: station.station_registration_number,
                    userType: 'fuel_station'  // Added to distinguish from regular users
                },
                process.env.JWT_SECRET || 'fallback_secret_key_not_for_production',
                { expiresIn: '24h' }
            );
            console.log("Generated token for station:", token);

            // Return station data (excluding password)
            const stationData = {
                id: station.id,
                full_name: station.full_name,
                nic: station.nic,
                fuel_station_name: station.fuel_station_name,
                station_registration_number: station.station_registration_number,
                location: station.location,
                registered_date: station.registered_date,
                contact_number1: station.contact_number1,
                contact_number2: station.contact_number2,
                email1: station.email1,
                email2: station.email2
            };

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                shedOwnerId: station.id,  // Matches your frontend expectation
                station: stationData     // Additional station details
            });
        });
    } catch (error) {
        console.error("Fuel station login error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            errorType: "SERVER_ERROR"
        });
    }
};