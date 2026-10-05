import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.AUTHOR,

  }
}, { timestamps: true });


const User = mongoose.model("User", userSchema);
export default User;