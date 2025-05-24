import express from "express";
import { getVehicleDetails } from "../controllers/vehicleController.js";

const router = express.Router();

// GET /api/vehicles/:identifier
router.get("/:identifier", getVehicleDetails);

export default router;
