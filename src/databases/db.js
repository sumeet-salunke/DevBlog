import env from "../config/env.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUrl);
    console.log("MongoDB connected successfully");
  }
  catch (err) {
    console.error("Error: ", err.message);
    process.exit(1);
  }
};

export default connectDB;