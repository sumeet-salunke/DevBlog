import { Router } from "express";
import { createPost, deletePost, editMyPost, getEditPost, getMyDrafts, getMyPosts, getMyPublishedPosts, getPublishedPostById } from "../controllers/post.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const router = Router();


router.get("/posts/create", requireAuth, (req, res) => {
  return res.render("createPost", {
    title: "Create Post",
    css: "/css/post.css",
    errors: [],
    oldInput: {
      title: "",
      content: "", tags: ""
    },
  });
});

router.post("/posts", requireAuth, createPost);

router.get("/my-posts", requireAuth, getMyPosts);
router.get("/my-posts/published", requireAuth, getMyPublishedPosts);



router.get("/my-posts/drafts", requireAuth, getMyDrafts);

router.get("/posts/:id/edit", requireAuth, getEditPost);
router.post("/posts/:id/edit", requireAuth, editMyPost);

router.get("/posts/:id", getPublishedPostById);
router.post("/posts/:id/delete", requireAuth, deletePost);

export default router;