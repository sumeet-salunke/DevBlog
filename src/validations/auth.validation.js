import { body } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required.")
    .custom((confirmPassword, { req }) => {
      return confirmPassword === req.body.password;
    })
    .withMessage("Password do not match"),
];