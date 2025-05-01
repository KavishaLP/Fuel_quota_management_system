
import express from "express";
import { registerFuelStation } from "../controllers/shedOwnerControllers.js";

const router = express.Router();

router.post("/shed-registers", registerFuelStation);

export default router;