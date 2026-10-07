import mongoose from "mongoose";
import { POST_STATUS } from "../constants/postStatus.js";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  content: {
    type: String,
    trim: true,
    maxLength: 1000,
  },
  tags: {
    type: [String],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(POST_STATUS),
    default: POST_STATUS.DRAFT,
  },
  publishedAt: Date,
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;
