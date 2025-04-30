import express from "express";
import { generateVehicleQRCode } from "../controllers/userMainControllers.js";
import { validateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to generate QR code
router.get('/vehicles/:vehicleId/qrcode', validateToken, generateVehicleQRCode);

export default router;