// controllers/userControllers.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { vehicleDB, motorTrafficDB } from "../config/sqldb.js";

export const registerVehicle = async (req, res) => {
  console.log(req.body); // Log incoming request body

  const { firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, confirmPassword } = req.body;

  // Validation checks
  if (!firstName || !lastName || !NIC || !vehicleType || !vehicleNumber || !engineNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if vehicle exists in motor traffic DB
    const checkRegisteredVehicleQuery = `SELECT * FROM registered_vehicles WHERE vehicleNumber = ? AND engineNumber = ?`;
    motorTrafficDB.query(checkRegisteredVehicleQuery, [vehicleNumber, engineNumber], async (err, registeredVehicleResult) => {
      if (err) {
        console.error("Error checking registered vehicle:", err);
        return res.status(500).json({ message: "Database error while checking registered vehicle." });
      }

      if (registeredVehicleResult.length === 0) {
        return res.status(400).json({ message: "Vehicle is not registered in motor traffic database." });
      }

      // Check if already registered in our system
      const checkVehicleQuery = `SELECT * FROM vehicleowner WHERE vehicleNumber = ? OR NIC = ?`;
      vehicleDB.query(checkVehicleQuery, [vehicleNumber, NIC], async (err, result) => {
        if (err) {
          console.error("Error checking vehicle:", err);
          return res.status(500).json({ message: "Database error while checking vehicle." });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: "Vehicle or NIC already registered." });
        }

        // Generate token and hash password
        const uniqueToken = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new registration
        const sql = `
          INSERT INTO vehicleowner (firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, uniqueToken) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        vehicleDB.query(sql, 
          [firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, hashedPassword, uniqueToken], 
          (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
              return res.status(500).json({ message: "Error registering vehicle owner" });
            }

            return res.json({
              message: "Vehicle registered successfully",
              uniqueToken,
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "An error occurred during registration", error: error.message });
  }
};