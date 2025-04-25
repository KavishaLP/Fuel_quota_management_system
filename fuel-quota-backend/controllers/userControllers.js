// controllers/userControllers.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { vehicleDB, motorTrafficDB } from "../config/sqldb.js";

export const registerVehicle = async (req, res) => {
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
      firstName, lastName, NIC, vehicleType, 
      vehicleNumber, engineNumber, password, confirmPassword
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
  
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errorType: "MISSING_FIELDS",
        missingFields
      });
    }
  
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        errorType: "PASSWORD_MISMATCH"
      });
    }
  
    // Validate NIC format (Sri Lankan NIC)
    if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(NIC)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NIC format. Valid formats: 123456789V or 123456789012",
        errorType: "INVALID_NIC"
      });
    }
  
    // Validate vehicle number format (Sri Lankan format)
    if (!/^[A-Z]{2,3}-\d{4}$/.test(vehicleNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle number format. Expected format: ABC-1234",
        errorType: "INVALID_VEHICLE_NUMBER"
      });
    }
  
    try {
      // Step 1: Check motor traffic database for vehicle existence
      const motorTrafficCheckQuery = `
        SELECT * FROM registered_vehicles 
        WHERE vehicleNumber = ? AND engineNumber = ? AND isActive = TRUE
      `;
      
      motorTrafficDB.query(motorTrafficCheckQuery, [vehicleNumber, engineNumber], 
      async (motorTrafficErr, motorTrafficResults) => {
        if (motorTrafficErr) {
          console.error("Motor traffic DB error:", motorTrafficErr);
          return res.status(500).json({
            success: false,
            message: "System error during vehicle verification",
            errorType: "DATABASE_ERROR"
          });
        }
  
        if (motorTrafficResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Vehicle not found in official records or inactive",
            errorType: "VEHICLE_NOT_FOUND",
            details: {
              vehicleNumber,
              engineNumber
            }
          });
        }
  
        const officialRecord = motorTrafficResults[0];
        
        // Verify NIC matches official records
        if (officialRecord.ownerNIC !== NIC) {
          return res.status(403).json({
            success: false,
            message: "NIC does not match official vehicle records",
            errorType: "OWNER_MISMATCH",
            officialOwner: officialRecord.ownerName,
            officialNIC: officialRecord.ownerNIC
          });
        }
  
        // Step 2: Check if already registered in our system
        const existingCheckQuery = `
          SELECT * FROM vehicleowner 
          WHERE vehicleNumber = ? OR NIC = ?
        `;
        
        vehicleDB.query(existingCheckQuery, [vehicleNumber, NIC], 
        async (existingErr, existingResults) => {
          if (existingErr) {
            console.error("Vehicle DB error:", existingErr);
            return res.status(500).json({
              success: false,
              message: "System error during registration check",
              errorType: "DATABASE_ERROR"
            });
          }
  
          if (existingResults.length > 0) {
            const conflicts = {
              NIC: existingResults.some(r => r.NIC === NIC),
              vehicleNumber: existingResults.some(r => r.vehicleNumber === vehicleNumber)
            };
            
            return res.status(409).json({
              success: false,
              message: conflicts.NIC && conflicts.vehicleNumber 
                ? "Vehicle and owner already registered" 
                : conflicts.NIC 
                  ? "Owner already registered with another vehicle" 
                  : "Vehicle already registered with another owner",
              errorType: "ALREADY_REGISTERED",
              conflicts
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
                  message: "Failed to complete registration",
                  errorType: "REGISTRATION_FAILED"
                });
              }
  
              // Success response
              return res.status(201).json({
                success: true,
                message: "Vehicle registration successful",
                data: {
                  registrationId: registrationResult.insertId,
                  owner: `${firstName} ${lastName}`,
                  vehicleDetails: {
                    number: vehicleNumber,
                    type: vehicleType,
                    engineNumber
                  },
                  token: uniqueToken,
                  officialDetails: {
                    make: officialRecord.make,
                    model: officialRecord.model,
                    year: officialRecord.year
                  }
                },
                nextSteps: [
                  "Save your unique token securely",
                  "Use the token to generate your QR code",
                  "Login to access your fuel quota"
                ]
              });
            });
          } catch (processingError) {
            console.error("Processing error:", processingError);
            return res.status(500).json({
              success: false,
              message: "Error during registration processing",
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
        errorType: "UNEXPECTED_ERROR"
      });
    }
  };