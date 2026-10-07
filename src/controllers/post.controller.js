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
      return res.redirect("/my-posts");
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
});

export const getMyPosts = asyncHandler(async (req, res) => {
  const authorId = req.session.user.id;

  const result = await postService.getAuthorPosts(authorId);
  return res.render("myPosts", {
    posts: result.data
  });

});

export const getMyPublishedPosts = asyncHandler(async (req, res) => {

  const publishedPosts = await postService.getPublishedAuthorPosts(req.session.user.id);
  return res.render("publishedPosts", {
    posts: publishedPosts.data
  });

});

export const getMyDrafts = asyncHandler(async (req, res) => {

  const draftPosts = await postService.getDraftAuthorPosts(req.session.user.id);
  return res.render("draft", {
    posts: draftPosts.data
  });

});

export const getPublishedPostById = asyncHandler(async (req, res) => {
  const result = await postService.getPublishedPostById(req.params.id);
  return res.render("post", {
    post: result.data
  });
});

export const getEditPost = asyncHandler(async (req, res) => {
  const result = await postService.getPostForEditing(req.session.user.id, req.params.id);
  return res.render("editPost", {
    post: result.data,
  })
})

export const editMyPost = asyncHandler(async (req, res) => {
  const result = await postService.updatePost(req.session.user.id, req.params.id, req.body);
  return res.redirect(`/posts/${req.params.id}`);
});