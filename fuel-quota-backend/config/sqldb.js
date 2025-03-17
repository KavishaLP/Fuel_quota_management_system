import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Vehicle Registration Database Connection
const vehicleDB = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME // This should be your vehicle registration DB
});

// Motor Traffic Department Database Connection
const motorTrafficDB = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MOTOR_DB_NAME // New environment variable for motor traffic DB
});

// Connect to both databases
vehicleDB.connect((err) => {
    if (err) {
        console.error("❌ Vehicle Registration Database Connection Failed:", err);
        return;
    }
    console.log("✅ Vehicle Registration Database connected!");
});

motorTrafficDB.connect((err) => {
    if (err) {
        console.error("❌ Motor Traffic Database Connection Failed:", err);
        return;
    }
    console.log("✅ Motor Traffic Department Database connected!");
});

// Export both connections as named exports
export { vehicleDB, motorTrafficDB };
