import { Router } from "express";
import { deleteAccount, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { loginValidation, registerValidation } from "../validations/auth.validation.js";
import requireAuth from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/register", registerValidation, registerUser);

router.post("/login", loginValidation, loginUser);

router.post("/logout", requireAuth, logoutUser);

router.post("/account/delete", requireAuth, deleteAccount);


export default router;