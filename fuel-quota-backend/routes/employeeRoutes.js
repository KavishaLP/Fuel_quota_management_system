import express from "express";
import { employeeLogin } from "../controllers/employeeController.js";

const router = express.Router();

// POST /api/employee/login
router.post("/login", employeeLogin);

export default router;
