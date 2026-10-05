import { validationResult } from "express-validator";
import ApiError from "../helpers/ApiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }
  next();
};

export default validate;