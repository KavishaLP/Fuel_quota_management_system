import express from "express";
import bodyParser from "body-parser";
import { QRCode } from "qrcode";
import bcrypt from "bcryptjs";
import db from "./config/sqldb.js"; // Import the database connection

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle vehicle registration
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, vehicleType, vehicleNumber, engineNumber, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !vehicleType || !vehicleNumber || !engineNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the data into the database
  const query = `INSERT INTO vehicles (first_name, last_name, vehicle_type, vehicle_number, engine_number, password) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [firstName, lastName, vehicleType, vehicleNumber, engineNumber, hashedPassword], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err.stack);
      return res.status(500).json({ message: "Error registering vehicle owner" });
    }

    // Create QR code data (can be a simple string or more complex URL)
    const qrData = `Vehicle: ${vehicleNumber} | Owner: ${firstName} ${lastName} | Type: ${vehicleType}`;
    
    QRCode.toDataURL(qrData, (err, qrCode) => {
      if (err) {
        console.error("Error generating QR code", err);
        return res.status(500).json({ message: "Error generating QR code" });
      }

      return res.json({
        message: "Vehicle registered successfully",
        qrCode,
      });
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
