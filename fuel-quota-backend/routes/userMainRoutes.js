import express from "express";
import { getVehicleOwnerById } from "../controllers/userMainControllers.js";

const router = express.Router();

router.get("/vehicleowners/:id", getVehicleOwnerById);
// router.get("/vehicleowners/:id/latest-transaction", getLatestFuelTransaction);

export default router;