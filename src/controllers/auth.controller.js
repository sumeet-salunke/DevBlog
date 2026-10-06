import { validationResult } from "express-validator";
import asyncHandler from "../helpers/asyncHandler.js";
// import ApiResponse from "../helpers/ApiResponse.js";
import authService from "../services/auth.service.js";


export const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("register", {
      title: "Register",
      css: "/css/auth.css",
      errors: errors.array().map((error) => error.msg),
      oldInput: {
        name: req.body.name,
        email: req.body.email,
      }
    })
  }
  try {
    await authService.registerUser(req.body);
    //for EJS
    return res.redirect("/login");
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(422).render("register", {
        //422 → request understood, but form data cannot be accepted
        title: "Register",
        css: "/css/auth.css",
        errors: [error.message],
        oldInput: {
          name: req.body.name,
          email: req.body.email,
        }
      })
    }
    throw error;
  }
  //for normal seprate frontend and backend
  // return res.status(201).json(new ApiResponse(201, result.message, result.data));
});

export const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("login", {
      title: "Login",
      css: "/css/auth.css",
      errors: errors.array().map((error) => error.msg),
      oldInput: {
        email: req.body.email,
      }
    })
  }
  try {
    const result = await authService.loginUser(req.body);
    req.session.user = {
      id: result.data.id,
      name: result.data.name,
      email: result.data.email,
      role: result.data.role,
    }

    res.redirect(
      "/"
    )

  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(422).render("login", {

        title: "Login",
        css: "/css/auth.css",
        errors: [error.message],
        oldInput: {
          email: req.body.email,
        }
      })
    }
    throw error;
  }


});

export const logoutUser = asyncHandler(async (req, res) => {
  req.session.user = null;
  return res.redirect("/login");
});