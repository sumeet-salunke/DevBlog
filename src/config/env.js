import "dotenv/config";

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUrl: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
  isProduction: process.env.NODE_ENV === "production",
}

export default env;
