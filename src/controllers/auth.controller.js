import asyncHandler from "../helpers/asyncHandler.js";
import ApiResponse from "../helpers/ApiResponse.js";
import authService from "../services/auth.service.js";


export const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return res.status(201).json(new ApiResponse(201, result.message, result.data));
});