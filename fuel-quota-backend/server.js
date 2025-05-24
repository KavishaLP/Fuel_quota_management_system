//server.js
//npm install node-cron

import express from "express";
import bodyParser from "body-parser";
import cron from 'node-cron';
import cors from "cors";
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/userRoutes.js";
import userMainRoutes from "./routes/userMainRoutes.js";
import shedOwnerRoutes from "./routes/shedOwnerRoutes.js";
import shedOwnerMainRoutes from "./routes/shedOwnerMainRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import {validateToken} from "./middleware/authMiddleware.js";
import { resetWeeklyQuotas } from "./utils/resetQuotas.js";
import {manualReset} from "./utils/resetQuotas.js"; // Import the manual reset function



const app = express();

// Initialize during server startup
setupQuotaResetCron();

const port = 5000;

app.use(express.json());

// Configure CORS properly
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(cookieParser());

// Routes
app.use("/api", userRoutes);
app.use("/userapi", userMainRoutes);

app.use("/shedapi", shedOwnerRoutes);
app.use("/shedownerapi", shedOwnerMainRoutes);

app.use("/api/employee", employeeRoutes);
app.use('/api/vehicles', vehicleRoutes);

app.get("/reset-test", manualReset);  // Manual reset endpoint for testing

function setupQuotaResetCron() {
  // Runs at 00:01 AM every Monday (1 minute past midnight)
  cron.schedule('1 0 * * 1', () => {
    console.log('Running weekly quota reset for ALL records...');
    
    resetWeeklyQuotas((result) => {
      console.log('Quota reset result:', result);
      
      // Add notification logic if needed
      if (!result.success) {
        // Send alert to admin
        console.error('Quota reset failed:', result.message);
      }
    });
  }, {
    scheduled: true,
    timezone: "Asia/Colombo" // Set your appropriate timezone
  });

  console.log('Weekly quota reset cron job scheduled (Mondays at 00:01)');
}

// Token verification endpoint
app.get('/api/verify-token', validateToken, (req, res) => {
  res.status(200).json({ 
    success: true, 
    userId: req.user.userId  // Only return essential data
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
