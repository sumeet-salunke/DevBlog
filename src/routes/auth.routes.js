import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { loginValidation, registerValidation } from "../validations/auth.validation.js";
import requireAuth from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/register", registerValidation, registerUser);

router.post("/login", loginValidation, loginUser);

router.post("/logout", requireAuth, logoutUser);




export default router;