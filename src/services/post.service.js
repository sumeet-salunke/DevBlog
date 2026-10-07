import ApiError from "../helpers/ApiError.js";
import postRepository from "../repositories/post.repository.js";
import { POST_MESSAGES } from "../constants/postMessages.js";
import { POST_STATUS } from "../constants/postStatus.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";

class PostService {


  validatePublishingRequirements({ title, content }) {
    if (!title || !title.trim()) {
      throw new ApiError(400, POST_MESSAGES.TITLE_REQUIRED);
    }
    if (title.length < 20) {
      throw new ApiError(400, POST_MESSAGES.TITLE_TOO_SHORT);
    }
    if (title.length > 500) {
      throw new ApiError(400, POST_MESSAGES.TITLE_TOO_LONG);
    }
    if (!content || !content.trim()) {
      throw new ApiError(400, POST_MESSAGES.CONTENT_REQUIRED);
    }
    if (content.length < 30) {
      throw new ApiError(400, POST_MESSAGES.CONTENT_TOO_SHORT);
    }
    if (content.length > 1000) {
      throw new ApiError(400, POST_MESSAGES.CONTENT_TOO_LONG);
    }
  }

  async createPost(authorId, postData) {
    const { title, content, tags, status = POST_STATUS.DRAFT } = postData;
    const newPostData = {
      title, content, tags, author: authorId, status
    };
    if (![POST_STATUS.DRAFT, POST_STATUS.PUBLISHED].includes(status)) {
      throw new ApiError(400, POST_MESSAGES.INVALID_POST_STATUS);
    }
    if (status === POST_STATUS.PUBLISHED) {
      this.validatePublishingRequirements({ title, content });
      newPostData.publishedAt = new Date();
    }
    const post = await postRepository.createPost(newPostData);
    return {
      message: POST_MESSAGES.POST_CREATED,
      data: post
    }
  }

  async getAuthorPosts(authorId) {
    if (!authorId) {
      throw new ApiError(401, POST_MESSAGES.UNAUTHORIZED);
    }
    const posts = await postRepository.findPostsByAuthor(authorId);


    return {
      message: POST_MESSAGES.POSTS_FETCHED,
      data: posts,
    }
  }

  async getPublishedAuthorPosts(authorId) {
    if (!authorId) {
      throw new ApiError(401, POST_MESSAGES.UNAUTHORIZED);
    }
    const publishedPosts = await postRepository.findPublishedPostsByAuthor(authorId);


    return {
      message: POST_MESSAGES.POSTS_FETCHED,
      data: publishedPosts,
    };
  }

  async getDraftAuthorPosts(authorId) {
    if (!authorId) {
      throw new ApiError(401, POST_MESSAGES.UNAUTHORIZED);
    }
    const draftPosts = await postRepository.findDraftPostsByAuthor(authorId);


    return {
      message: POST_MESSAGES.POSTS_FETCHED,
      data: draftPosts,
    };
  }

  async getPublishedPostById(postId) {
    if (!postId) {
      throw new ApiError(400, POST_MESSAGES.POSTID_REQUIRED);
    }
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, POST_MESSAGES.INVALID_POSTID);
    }
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(404, POST_MESSAGES.POST_NOT_FOUND);
    }
    if (post.status !== POST_STATUS.PUBLISHED) {
      throw new ApiError(404, POST_MESSAGES.POST_NOT_AVAILABLE_YET);
    }
    return {
      message: POST_MESSAGES.POSTS_FETCHED,
      data: post
    }
  }

  async updatePost(authorId, postId, updateData) {
    if (!postId) {
      throw new ApiError(400, POST_MESSAGES.POSTID_REQUIRED);
    }
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(404, POST_MESSAGES.POST_NOT_FOUND);
    }
    if (post.author.toString() !== authorId.toString()) {
      throw new ApiError(403, POST_MESSAGES.FORBIDDEN);
    }
    const { title, content, tags, status } = updateData;

    if (![POST_STATUS.PUBLISHED, POST_STATUS.DRAFT].includes(status)) {
      throw new ApiError(400, POST_MESSAGES.INVALID_POST_STATUS);
    }
    //A published post cannot be converted back into draft
    if (post.status === POST_STATUS.PUBLISHED && status === POST_STATUS.DRAFT) {
      throw new ApiError(400, POST_MESSAGES.CANNOT_UNPUBLISH);
    }
    const updateFields = { title, content, tags, status };
    //publishing requires stricter validation
    if (status === POST_STATUS.PUBLISHED) {

      this.validatePublishingRequirements({ title, content, });
    }
    if (post.status === POST_STATUS.DRAFT) {
      updateFields.publishedAt = new Date();
    }

    const updatedPost = await postRepository.updatePost(postId, updateFields);
    return {
      message: POST_MESSAGES.POST_UPDATED,
      data: updatedPost,
    }
  }

  async getPostForEditing(authorId, postId) {
    if (!postId) {
      throw new ApiError(400, POST_MESSAGES.POSTID_REQUIRED);
    }
    const post = await postRepository.findPostByIdWithoutPopulate
      (postId);

    if (!post) {
      throw new ApiError(404, POST_MESSAGES.POST_NOT_FOUND);
    }
    if (post.author.toString() !== authorId.toString()) {
      throw new ApiError(403, POST_MESSAGES.FORBIDDEN);
    }
    return {
      message: POST_MESSAGES.POSTS_FETCHED,
      data: post,
    }
  }
}

export default new PostService();