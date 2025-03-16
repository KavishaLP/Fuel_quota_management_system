import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import db from "./config/sqldb.js"; // Importing database connections
import cors from "cors"; // CORS middleware
import crypto from "crypto"; // To generate a unique token

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle vehicle registration
app.post("/api/register", async (req, res) => {
  console.log(req.body); // Log the request body to see the incoming data

  const { firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, confirmPassword } = req.body;

  // Validation checks
  if (!firstName || !lastName || !NIC || !vehicleType || !vehicleNumber || !engineNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // 1. Validate the vehicle details (vehicleNumber, engineNumber, NIC) with motorTrafficDB
    const vehicleValidationQuery = `
      SELECT * FROM registered_vehicles WHERE vehicleNumber = ? AND engineNumber = ? AND NIC = ?
    `;

    db.motorTrafficDB.query(vehicleValidationQuery, [vehicleNumber, engineNumber, NIC], async (err, result) => {
      if (err) {
        console.error("Error during validation:", err);
        return res.status(500).json({ message: "Unable to validate vehicle details. Please try again later." });
      }

      // If no matching record found
      if (result.length === 0) {
        return res.status(400).json({ message: "Vehicle information not found. Please verify the details." });
      }

      // 2. Check if vehicle is already registered
      const checkVehicleQuery = `SELECT * FROM vehicleowner WHERE vehicleNumber = ?`;
      db.vehicleDB.query(checkVehicleQuery, [vehicleNumber], async (err, existingVehicle) => {
        if (err) {
          console.error("Error checking existing vehicle:", err);
          return res.status(500).json({ message: "Error checking vehicle registration" });
        }

        if (existingVehicle.length > 0) {
          return res.status(400).json({ message: "Vehicle already registered" });
        }

        // 3. Generate a unique token if validation is successful
        const uniqueToken = crypto.randomBytes(16).toString("hex"); // Generate a random token (16 bytes)

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Insert vehicle owner data into VEHICLEOWNER table
        const insertQuery = `
          INSERT INTO vehicleowner (firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password, uniqueToken) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.vehicleDB.query(insertQuery, [firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, hashedPassword, uniqueToken], (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ message: "Error registering vehicle owner" });
          }

          // If successful, return the message and the unique token
          return res.json({
            message: "Vehicle registered successfully",
            uniqueToken, // Token for later QR code generation
          });
        });
      });
    });

  } catch (error) {
    console.error("Error during registration: ", error); // Log detailed error
    return res.status(500).json({ message: "An error occurred during registration", error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
