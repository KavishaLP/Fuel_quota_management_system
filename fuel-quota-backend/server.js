//server.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = 5000;

app.use(express.json());

// Use CORS middleware
app.use(cors({
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(cookieParser());

// Routes
app.use("/api", userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
