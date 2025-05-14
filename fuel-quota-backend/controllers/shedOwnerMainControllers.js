import bcrypt from "bcrypt";
import vehicleDB from "../config/sqldb.js"; // Assuming you have a database connection file

// Register Employee
export const registerEmployee = async (req, res) => {
    const { station_registration_number, name, email, password } = req.body;

    if (!station_registration_number || !name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if the email is already registered
        const [existingEmployee] = await vehicleDB.query(
            "SELECT * FROM employees WHERE email = ?",
            [email]
        );

        if (existingEmployee.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the employee into the database
        await vehicleDB.query(
            "INSERT INTO employees (station_registration_number, name, email, password_hash) VALUES (?, ?, ?, ?)",
            [station_registration_number, name, email, hashedPassword]
        );

        res.status(201).json({ message: "Employee registered successfully." });
    } catch (error) {
        console.error("Error registering employee:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
