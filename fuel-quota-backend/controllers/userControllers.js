// controllers/userControllers.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { vehicleDB, motorTrafficDB } from "../config/sqldb.js";

export const registerVehicle = async (req, res) => {
    const { firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, confirmPassword } = req.body;
  
    // Input validation
    if (!firstName || !lastName || !NIC || !vehicleType || !vehicleNumber || !engineNumber || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required",
        errorType: "MISSING_FIELDS",
        fields: {
          firstName: !firstName,
          lastName: !lastName,
          NIC: !NIC,
          vehicleType: !vehicleType,
          vehicleNumber: !vehicleNumber,
          engineNumber: !engineNumber,
          password: !password,
          confirmPassword: !confirmPassword
        }
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
  
    // Validate NIC format (example for Sri Lankan NIC)
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(NIC)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NIC format",
        errorType: "INVALID_NIC_FORMAT"
      });
    }
  
    // Validate vehicle number format (example for Sri Lankan format)
    const vehicleNumberRegex = /^[A-Za-z]{2,3}-[0-9]{4}$/;
    if (!vehicleNumberRegex.test(vehicleNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle number format (Expected format: ABC-1234)",
        errorType: "INVALID_VEHICLE_NUMBER"
      });
    }
  
    try {
      // Check motor traffic database
      const checkRegisteredVehicleQuery = `SELECT * FROM registered_vehicles WHERE vehicleNumber = ? AND engineNumber = ?`;
      motorTrafficDB.query(checkRegisteredVehicleQuery, [vehicleNumber, engineNumber], async (err, registeredVehicleResult) => {
        if (err) {
          console.error("Motor traffic DB error:", err);
          return res.status(500).json({
            success: false,
            message: "System error while validating vehicle details",
            errorType: "DATABASE_ERROR",
            systemError: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
  
        if (registeredVehicleResult.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Vehicle not found in motor traffic database. Please ensure details are correct.",
            errorType: "VEHICLE_NOT_REGISTERED",
            details: {
              vehicleNumber,
              engineNumber
            }
          });
        }
  
        // Check if already registered in our system
        const checkVehicleQuery = `SELECT * FROM vehicleowner WHERE vehicleNumber = ? OR NIC = ?`;
        vehicleDB.query(checkVehicleQuery, [vehicleNumber, NIC], async (err, result) => {
          if (err) {
            console.error("Vehicle DB error:", err);
            return res.status(500).json({
              success: false,
              message: "System error while checking existing registration",
              errorType: "DATABASE_ERROR",
              systemError: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
          }
  
          if (result.length > 0) {
            const existingByNIC = result.some(r => r.NIC === NIC);
            const existingByVehicle = result.some(r => r.vehicleNumber === vehicleNumber);
            
            return res.status(409).json({
              success: false,
              message: existingByNIC && existingByVehicle 
                ? "NIC and vehicle number already registered" 
                : existingByNIC 
                  ? "NIC already registered" 
                  : "Vehicle number already registered",
              errorType: "ALREADY_REGISTERED",
              conflicts: {
                NIC: existingByNIC,
                vehicleNumber: existingByVehicle
              }
            });
          }
  
          try {
            // Generate token and hash password
            const uniqueToken = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(password, 10);
  
            // Insert new registration
            const insertQuery = `
              INSERT INTO vehicleowner 
              (firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, uniqueToken) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
  
            vehicleDB.query(insertQuery, 
              [firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, hashedPassword, uniqueToken], 
              (err, result) => {
                if (err) {
                  console.error("Registration error:", err);
                  return res.status(500).json({
                    success: false,
                    message: "Failed to complete registration",
                    errorType: "REGISTRATION_FAILED",
                    systemError: process.env.NODE_ENV === 'development' ? err.message : undefined
                  });
                }
  
                // Success response
                return res.status(201).json({
                  success: true,
                  message: "Vehicle registration completed successfully",
                  data: {
                    registrationId: result.insertId,
                    vehicleNumber,
                    NIC,
                    token: uniqueToken
                  },
                  nextSteps: {
                    message: "Please save your unique token for future reference",
                    action: "PROCEED_TO_LOGIN"
                  }
                });
              }
            );
          } catch (hashError) {
            console.error("Password hashing error:", hashError);
            return res.status(500).json({
              success: false,
              message: "System error during registration",
              errorType: "SYSTEM_ERROR"
            });
          }
        });
      });
    } catch (error) {
      console.error("Unexpected registration error:", error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred during registration",
        errorType: "UNEXPECTED_ERROR",
        systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };