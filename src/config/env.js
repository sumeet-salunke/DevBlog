import "dotenv/config";

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUrl: process.env.MONGO_URI
}

export default env;