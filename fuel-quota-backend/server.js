//server.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/userRoutes.js";
import userMainRoutes from "./routes/userMainRoutes.js";
import {validateToken} from "./middleware/authMiddleware.js";

const app = express();
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
