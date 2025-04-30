import express from "express";
import { getVehicleOwnerById } from "../controllers/userMainControllers.js";


const router = express.Router();

router.get("/vehicleowners/:id", getVehicleOwnerById);

export default router;