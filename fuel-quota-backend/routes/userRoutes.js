// routes/userRoutes.js

import express from "express";
import { registerVehicle, loginUser, getVehicleTypes } from "../controllers/userControllers.js";

const router = express.Router();

// POST /api/register
router.post("/register", registerVehicle);
router.post("/login", loginUser);
router.get("/vehicle-types", getVehicleTypes);

export default router;