//server.js

import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import { vehicleDB, motorTrafficDB } from "./config/sqldb.js"; // ✅ Import both DBs correctly
import cors from "cors";
import crypto from "crypto"; // For generating a unique token

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle vehicle registration
app.post("/api/register", async (req, res) => {
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
    // Check if vehicle already exists in the database
    const checkRegisteredVehicleQuery = `SELECT * FROM registered_vehicles WHERE vehicleNumber = ? AND engineNumber = ?`;
    motorTrafficDB.query(checkRegisteredVehicleQuery, [vehicleNumber, engineNumber], async (err, registeredVehicleResult) => {
      if (err) {
        console.error("Error checking registered vehicle:", err);
        return res.status(500).json({ message: "Database error while checking registered vehicle." });
      }

      if (registeredVehicleResult.length === 0) {
        return res.status(400).json({ message: "Vehicle is not registered in motor traffic database." });
      }

      const checkVehicleQuery = `SELECT * FROM vehicleowner WHERE vehicleNumber = ? OR NIC = ?`;
      vehicleDB.query(checkVehicleQuery, [vehicleNumber, NIC], async (err, result) => { // ✅ Use vehicleDB
        if (err) {
          console.error("Error checking vehicle:", err);
          return res.status(500).json({ message: "Database error while checking vehicle." });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: "Vehicle or NIC already registered." });
        }

        // Generate a unique token
        const uniqueToken = crypto.randomBytes(16).toString("hex");

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert vehicle owner data into the vehicleowner table
        const sql = `
          INSERT INTO vehicleowner (firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, uniqueToken) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        vehicleDB.query(sql, [firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, hashedPassword, uniqueToken], (err, result) => { // ✅ Use vehicleDB
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ message: "Error registering vehicle owner" });
          }

          return res.json({
            message: "Vehicle registered successfully",
            uniqueToken, // Token for later use (e.g., QR code generation)
          });
        });
      });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "An error occurred during registration", error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
