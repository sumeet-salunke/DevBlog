import { Router } from "express";
import requireAuth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    css: "/css/auth.css",
    errors: [],
    oldInput: {
      email: "",
    }
  })
});



export default router;