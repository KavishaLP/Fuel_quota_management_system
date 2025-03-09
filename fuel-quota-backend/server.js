// server.js

const express = require("express");
const bodyParser = require("body-parser");
const { QRCode } = require("qrcode");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MySQL Database Connection


// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Route to handle vehicle registration
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, vehicleType, vehicleNumber, engineNumber, password, rePassword } = req.body;

  // Validation checks
  if (!firstName || !lastName || !vehicleType || !vehicleNumber || !engineNumber || !password || !rePassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== rePassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Check if the vehicle number already exists
  db.query("SELECT * FROM VehicleOwner WHERE vehicleNumber = ?", [vehicleNumber], (err, results) => {
    if (err) {
      console.error("Error checking vehicle number:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Vehicle number already exists" });
    }

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ message: "Error processing password" });
      }

      // Create QR code data (can be a simple string or more complex URL)
      const qrData = `Vehicle: ${vehicleNumber} | Owner: ${firstName} ${lastName} | Type: ${vehicleType}`;

      // Insert the new vehicle owner into the database
      const query = `
        INSERT INTO VehicleOwner (firstName, lastName, vehicleType, vehicleNumber, engineNumber, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(query, [firstName, lastName, vehicleType, vehicleNumber, engineNumber, hashedPassword], async (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ message: "Error registering vehicle" });
        }

        try {
          // Generate QR code
          const qrCode = await QRCode.toDataURL(qrData);
          return res.json({ message: "Vehicle registered successfully", qrCode });
        } catch (qrError) {
          console.error("Error generating QR code:", qrError);
          res.status(500).json({ message: "Error generating QR code" });
        }
      });
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
