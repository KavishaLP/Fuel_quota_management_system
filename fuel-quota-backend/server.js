// server.js
const express = require("express");
const bodyParser = require("body-parser");
const {QRCode }= require("qrcode");

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle vehicle registration
app.post("/api/register", async (req, res) => {
  const { ownerName, vehicleNumber, vehicleType } = req.body;

  if (!ownerName || !vehicleNumber || !vehicleType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create QR code data (can be a simple string or more complex URL)
  const qrData = `Vehicle: ${vehicleNumber} | Owner: ${ownerName} | Type: ${vehicleType}`;

  try {
    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrData);
    return res.json({ qrCode });
  } catch (err) {
    console.error("Error generating QR code", err);
    res.status(500).json({ message: "Error generating QR code" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
