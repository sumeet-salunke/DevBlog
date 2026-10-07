import { POST_STATUS } from "../constants/postStatus.js";
import Post from "../models/Post.js";


class PostRepository {

  async createPost(postData) {
    return Post.create(postData);
  }

  async findPostById(postId) {
    return Post.findById(postId).populate("author", "name");
  }
  async findPostsByAuthor(authorId) {
    return Post.find({ author: authorId });
  }

  async findPublishedPosts() {
    return Post.find({ status: POST_STATUS.PUBLISHED }).populate("author", "name");
  }
  async updatePost(postId, updateData) {
    return Post.findByIdAndUpdate(postId,
      {
        $set: updateData
      }, {
      returnDocument: "after",
      runValidators: true,
    }
    )
  }

  async deletePost(postId) {
    return Post.findByIdAndDelete(postId);
  }

  async findPublishedPostsByAuthor(authorId) {
    return Post.find({
      author: authorId,
      status: POST_STATUS.PUBLISHED,
    });
  }
  async findDraftPostsByAuthor(authorId) {
    return Post.find({
      author: authorId,
      status: POST_STATUS.DRAFT,
    });
  }

  async findPostByIdWithoutPopulate(postId) {
    return Post.findById(postId);
  }

  async deletePostsByAuthor(authorId) {
    return Post.deleteMany({ author: authorId });
  }
}

export default new PostRepository();
