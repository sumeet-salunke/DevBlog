import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieSession from "cookie-session";

import authRoutes from "./routes/auth.routes.js";
import pageRoutes from "./routes/page.routes.js";
import postRoutes from "./routes/post.routes.js";

import env from "./config/env.js";
import errorHandler from "./middlewares/error.middleware.js";
import csrfProtection from "./middlewares/csrf.middleware.js";



const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: "devblog_session",
  keys: [env.sessionSecret],
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
});

app.use(csrfProtection);


app.get("/", (req, res) => {
  const title = "DevBlog";
  const message = "Learning Server-side Rendering";
  res.render("home", {
    title, message
  });
});


app.use("/", pageRoutes);
app.use("/", authRoutes);
app.use("/", postRoutes);

app.use((req, res) => {
  return res.status(404).render("404");
});

app.use(errorHandler);

export default app;
