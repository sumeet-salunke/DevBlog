import { Router } from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import { getSettings } from "../controllers/page.controller.js";

const router = Router();

router.get("/settings", requireAuth, getSettings);

router.get("/register", (req, res) => {
  res.render("register", {
    errors: [],
    oldInput: {
      name: "", email: ""
    }
  });
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
