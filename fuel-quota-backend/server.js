import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import db from "./config/sqldb.js";  // Database connection file import
import cors from "cors";  // CORS middleware
import crypto from "crypto";  // To generate unique token

const app = express();
const port = 5000;

// Use cors middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle vehicle registration
app.post("/api/register", async (req, res) => {
  console.log(req.body);  // Log the request body to see the incoming data

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

      // 2. Generate a unique token if validation is successful
      const uniqueToken = crypto.randomBytes(16).toString("hex"); // Generate a random token (16 bytes)

      // 3. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Insert vehicle owner data into vehicleowner table
      const query = `INSERT INTO vehicleowner (uniqueToken, firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      // Execute query to insert the data along with the generated unique token
      db.vehicleDB.query(query, [uniqueToken, firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, hashedPassword], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err.stack);
          return res.status(500).json({ message: "Error registering vehicle owner" });
        }

        // If successful, return the message and the unique token
        return res.json({
          message: "Vehicle registered successfully",
          uniqueToken, // Token for later QR code generation
        });
      });
    });

  } catch (error) {
    console.error("Error during registration: ", error);  // Log detailed error
    return res.status(500).json({ message: "An error occurred during registration", error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
