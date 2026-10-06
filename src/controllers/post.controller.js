import { POST_STATUS } from "../constants/postStatus.js";
import asyncHandler from "../helpers/asyncHandler.js";
import postService from "../services/post.service.js";

export const createPost = asyncHandler(async (req, res) => {
  const authorId = req.session.user.id;
  const postData = req.body;
  try {
    const result = await postService.createPost(authorId, postData);
    if (result.data.status === POST_STATUS.DRAFT) {
      return res.redirect("/drafts");
    }
    if (result.data.status === POST_STATUS.PUBLISHED) {
      return res.redirect("/posts");
    }

  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(422).render("createPost", {
        title: "CreatePost",
        css: "/css/post.css",
        errors: [err.message],
        oldInput: {
          title: req.body.title,
          content: req.body.content,
          tags: req.body.tags,
        }
      })
    }
    else {
      throw err;
    }
  }
})