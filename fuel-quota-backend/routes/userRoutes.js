// routes/userRoutes.js

// routes/userRoutes.js
import express from "express";
import { registerVehicle } from "../controllers/userControllers.js";

const router = express.Router();

// POST /api/register
router.post("/register", registerVehicle);
router.post("/login", registerVehicle);

export default router;