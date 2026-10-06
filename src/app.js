import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieSession from "cookie-session";

import authRoutes from "./routes/auth.routes.js";
import pageRoutes from "./routes/page.routes.js";
import postRoutes from "./routes/post.routes.js";

import env from "./config/env.js";
import errorHandler from "./middlewares/error.middleware.js";



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
  secure: false,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7
}));


app.get("/", (req, res) => {
  const title = "DevBlog";
  const message = "Learning Server-side Rendering";
  res.render("home", {
    title, message
  });
});

app.get("/posts", (req, res) => {
  const posts = [
    {
      title: "Learning Node.js",
      author: "Sumeet",
      published: true
    },
    {
      title: "Understanding Express",
      author: "Sumeet",
      published: false

    }
    , {
      title: "Gettimg started with EJS",
      author: "Sumeet",
      published: true

    }
  ];
  res.render("posts", { title: "Posts", posts });
});

app.use("/", pageRoutes);
app.use("/", authRoutes);
app.use("/", postRoutes);

app.use((req, res) => {
  return res.status(404).render("404");
});

app.use(errorHandler);

export default app;