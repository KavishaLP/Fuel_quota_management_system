import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vehicleDB } from "../config/sqldb.js";

export const employeeLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
      errorType: "VALIDATION_ERROR",
    });
  }

  const query = "SELECT * FROM employees WHERE email = ?";
  vehicleDB.query(query, [email], async (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        errorType: "DATABASE_ERROR",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errorType: "AUTHENTICATION_ERROR",
      });
    }

    const employee = results[0];
    const isMatch = await bcrypt.compare(password, employee.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errorType: "AUTHENTICATION_ERROR",
      });
    }

    const token = jwt.sign(
      {
        userId: employee.ID,
        email: employee.email,
        stationId: employee.station_registration_number,
        userType: "employee",
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee: {
        id: employee.ID,
        name: employee.name,
        email: employee.email,
        station_registration_number: employee.station_registration_number,
        mobile_number: employee.mobile_number,
      },
    });
  });
};
