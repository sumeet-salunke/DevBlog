import { Router } from "express";
import { createPost } from "../controllers/post.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const router = Router();


router.get("/posts/create", requireAuth, (req, res) => {
  return res.render("createPost", {
    title: "Create Post",
    css: "/css/post/css",
    errors: [],
    oldInput: {
      title: "",
      content: "", tags: ""
    },
  });
});

router.post("/posts", requireAuth, createPost);



export default router;