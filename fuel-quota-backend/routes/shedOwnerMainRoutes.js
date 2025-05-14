import express from "express";
import { registerEmployee } from "../controllers/shedOwnerMainControllers.js";

const router = express.Router();

// Route to register an employee
router.post("/register-employee", registerEmployee);

export default router;
