import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import db from "./config/sqldb.js";  // Database connection file import
import cors from "cors";  // CORS middleware

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
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO vehicleowner (firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, password) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Use the vehicleDB connection to run the query
    db.vehicleDB.query(query, [firstName, lastName, NIC, vehicleType, vehicleNumber, engineNumber, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ message: "Error registering vehicle owner", error: err });
      }
      return res.json({ message: "Vehicle registered successfully" });
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
