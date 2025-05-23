import express from "express";
import {
  registerEmployee,
  fetchEmployees,
  updateEmployee,
  deleteEmployee,
  fetchUserDetails,
} from "../controllers/shedOwnerMainControllers.js";

const router = express.Router();

// Route to register an employee
router.post("/register-employee", registerEmployee);

// Route to fetch all employees
router.get("/employees", fetchEmployees);

// Route to update an employee
router.put("/employees/:id", updateEmployee);

// Route to delete an employee
router.delete("/employees/:id", deleteEmployee);

// Route to fetch user details
router.get("/user-details", fetchUserDetails);

export default router;
