
import express from "express";
import { registerFuelStation, loginFuelStation } from "../controllers/shedOwnerControllers.js";


const router = express.Router();

router.post("/shed-registers", registerFuelStation);
router.post("/shed-login", loginFuelStation);

export default router;