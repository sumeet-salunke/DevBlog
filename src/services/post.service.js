import ApiError from "../helpers/ApiError.js";
import postRepository from "../repositories/post.repository.js";
import { POST_MESSAGES } from "../constants/postMessages.js";
import { POST_STATUS } from "../constants/postStatus.js";

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

}

export default new PostService();