import "./config/dns.js";
import app from "./app.js";
import connectDB from "./databases/db.js";
import env from "./config/env.js";


const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    })
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

startServer();