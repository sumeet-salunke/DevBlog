import express from "express";
import path from "path";
import { fileURLToPath } from "url";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

export default app;