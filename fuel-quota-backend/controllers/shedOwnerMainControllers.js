import bcrypt from "bcrypt";
import { vehicleDB } from "../config/sqldb.js";

// Register Employee
export const registerEmployee = (req, res) => {
  const { station_registration_number, name, email, password } = req.body;

  if (!station_registration_number || !name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  vehicleDB.query(
    "SELECT * FROM employees WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error checking existing employee:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "Email is already registered." });
      }

      bcrypt.genSalt(10, (saltErr, salt) => {
        if (saltErr) {
          console.error("Error generating salt:", saltErr);
          return res.status(500).json({ message: "Internal server error." });
        }

        bcrypt.hash(password, salt, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.error("Error hashing password:", hashErr);
            return res.status(500).json({ message: "Internal server error." });
          }

          vehicleDB.query(
            "INSERT INTO employees (station_registration_number, name, email, password_hash) VALUES (?, ?, ?, ?)",
            [station_registration_number, name, email, hashedPassword],
            (insertErr) => {
              if (insertErr) {
                console.error("Error inserting employee:", insertErr);
                return res
                  .status(500)
                  .json({ message: "Internal server error." });
              }

              res
                .status(201)
                .json({ message: "Employee registered successfully." });
            }
          );
        });
      });
    }
  );
};

// Fetch Employee List
export const fetchEmployees = (req, res) => {
  vehicleDB.query(
    "SELECT ID, name, email FROM employees",
    (err, results) => {
      if (err) {
        console.error("Error fetching employees:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json(results);
    }
  );
};

// Update Employee
export const updateEmployee = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  vehicleDB.query(
    "UPDATE employees SET name = ?, email = ? WHERE ID = ?",
    [name, email, id],
    (err) => {
      if (err) {
        console.error("Error updating employee:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json({ message: "Employee updated successfully." });
    }
  );
};

// Delete Employee
export const deleteEmployee = (req, res) => {
  const { id } = req.params;

  vehicleDB.query(
    "DELETE FROM employees WHERE ID = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Error deleting employee:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json({ message: "Employee deleted successfully." });
    }
  );
};

// Fetch User Details
export const fetchUserDetails = (req, res) => {
  const { userId } = req.user; // Assuming userId is available in the request object

  vehicleDB.query(
    "SELECT name, email FROM users WHERE ID = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }
      res.status(200).json(results[0]);
    }
  );
};
