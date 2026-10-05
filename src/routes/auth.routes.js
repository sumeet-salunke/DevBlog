import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { registerValidation } from "../validations/auth.validation.js";
import validate from "../middlewares/valiadate.js";

const router = Router();

router.post("/register", registerValidation, validate, registerUser);


export default router;