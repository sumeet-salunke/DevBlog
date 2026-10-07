import assert from "node:assert/strict";
import { test } from "node:test";

import { deleteAccount, logoutUser } from "../src/controllers/auth.controller.js";
import ApiError from "../src/helpers/ApiError.js";
import requireAuth from "../src/middlewares/auth.middleware.js";
import csrfProtection from "../src/middlewares/csrf.middleware.js";
import errorHandler from "../src/middlewares/error.middleware.js";
import { POST_STATUS } from "../src/constants/postStatus.js";
import postRepository from "../src/repositories/post.repository.js";
import userRepository from "../src/repositories/user.repository.js";
import authService from "../src/services/auth.service.js";
import postService from "../src/services/post.service.js";
import { hashPassword } from "../src/utils/password/hashPassword.js";
import { verifyPassword } from "../src/utils/password/verifyPassword.js";

const AUTHOR_ID = "507f1f77bcf86cd799439011";
const OTHER_AUTHOR_ID = "507f1f77bcf86cd799439012";
const POST_ID = "507f1f77bcf86cd799439013";

const createPost = (overrides = {}) => ({
  _id: POST_ID,
  title: "A sufficiently long post title",
  content: "This content is sufficiently long for publishing.",
  tags: [],
  author: { toString: () => AUTHOR_ID },
  status: POST_STATUS.DRAFT,
  ...overrides,
});

const expectApiError = async (promise, statusCode, message) => {
  await assert.rejects(promise, (error) => {
    assert.equal(error instanceof ApiError, true);
    assert.equal(error.statusCode, statusCode);
    if (message) assert.equal(error.message, message);
    return true;
  });
};

const invokeController = (controller, req, res) => new Promise((resolve, reject) => {
  const next = (error) => (error ? reject(error) : resolve());
  const redirect = res.redirect;
  res.redirect = (...args) => {
    if (redirect) redirect(...args);
    resolve();
  };
  controller(req, res, next);
});

test("registration accepts valid data and hashes the password", async () => {
  const originalFind = userRepository.findUserByEmail;
  const originalCreate = userRepository.createUser;
  let createdData;
  userRepository.findUserByEmail = async () => null;
  userRepository.createUser = async (data) => {
    createdData = data;
    return { name: data.name, email: data.email };
  };

  try {
    const result = await authService.registerUser({
      name: "Test Author",
      email: "author@example.test",
      password: "correct horse battery staple",
    });
    assert.equal(result.data.email, "author@example.test");
    assert.notEqual(createdData.passwordHash, "correct horse battery staple");
    assert.equal(await verifyPassword("correct horse battery staple", createdData.passwordHash), true);
  } finally {
    userRepository.findUserByEmail = originalFind;
    userRepository.createUser = originalCreate;
  }
});

test("duplicate email registration is rejected", async () => {
  const originalFind = userRepository.findUserByEmail;
  userRepository.findUserByEmail = async () => ({ _id: "existing" });
  try {
    await expectApiError(
      authService.registerUser({ name: "Test Author", email: "used@example.test", password: "password" }),
      409,
    );
  } finally {
    userRepository.findUserByEmail = originalFind;
  }
});

test("valid login returns safe session data", async () => {
  const originalFind = userRepository.findUserByEmail;
  const passwordHash = await hashPassword("correct password");
  userRepository.findUserByEmail = async () => ({
    _id: { toString: () => AUTHOR_ID },
    name: "Test Author",
    email: "author@example.test",
    role: "AUTHOR",
    passwordHash,
  });
  try {
    const result = await authService.loginUser({ email: "author@example.test", password: "correct password" });
    assert.deepEqual(result.data, {
      id: AUTHOR_ID,
      name: "Test Author",
      email: "author@example.test",
      role: "AUTHOR",
    });
  } finally {
    userRepository.findUserByEmail = originalFind;
  }
});

test("invalid login credentials are rejected", async () => {
  const originalFind = userRepository.findUserByEmail;
  userRepository.findUserByEmail = async () => null;
  try {
    await expectApiError(
      authService.loginUser({ email: "missing@example.test", password: "wrong password" }),
      400,
      "Invalid credentials",
    );
  } finally {
    userRepository.findUserByEmail = originalFind;
  }
});

test("logout clears the authenticated session", async () => {
  const req = { session: { user: { id: AUTHOR_ID } } };
  let redirectedTo;
  await invokeController(logoutUser, req, { redirect: (path) => { redirectedTo = path; } });
  assert.equal(req.session.user, null);
  assert.equal(redirectedTo, "/login");
});

test("unauthenticated requests are redirected and authenticated requests continue", () => {
  let redirectedTo;
  let continued = false;
  requireAuth({ session: {} }, { redirect: (path) => { redirectedTo = path; } }, () => { continued = true; });
  assert.equal(redirectedTo, "/login");
  requireAuth({ session: { user: { id: AUTHOR_ID } } }, {}, () => { continued = true; });
  assert.equal(continued, true);
});

test("valid published posts can be created", async () => {
  const originalCreate = postRepository.createPost;
  let savedPost;
  postRepository.createPost = async (data) => {
    savedPost = { ...data, status: data.status };
    return savedPost;
  };
  try {
    const result = await postService.createPost(AUTHOR_ID, {
      title: "A sufficiently long post title",
      content: "This content is sufficiently long for publishing.",
      status: POST_STATUS.PUBLISHED,
      tags: "js, node",
    });
    assert.equal(result.data.status, POST_STATUS.PUBLISHED);
    assert.equal(savedPost.publishedAt instanceof Date, true);
    assert.deepEqual(savedPost.tags, ["js", "node"]);
  } finally {
    postRepository.createPost = originalCreate;
  }
});

test("incomplete drafts can be created", async () => {
  const originalCreate = postRepository.createPost;
  let savedPost;
  postRepository.createPost = async (data) => {
    savedPost = data;
    return data;
  };
  try {
    await postService.createPost(AUTHOR_ID, { title: "", content: "", status: POST_STATUS.DRAFT });
    assert.equal(savedPost.status, POST_STATUS.DRAFT);
    assert.equal("publishedAt" in savedPost, false);
  } finally {
    postRepository.createPost = originalCreate;
  }
});

test("invalid published posts are rejected", async () => {
  await expectApiError(
    postService.createPost(AUTHOR_ID, { title: "Too short", content: "short", status: POST_STATUS.PUBLISHED }),
    400,
  );
});

test("public published-post listing reuses the published repository query", async () => {
  const originalFindPublished = postRepository.findPublishedPosts;
  const publishedPosts = [createPost({ status: POST_STATUS.PUBLISHED })];
  let repositoryCalled = false;
  postRepository.findPublishedPosts = async () => {
    repositoryCalled = true;
    return publishedPosts;
  };
  try {
    const result = await postService.getPublishedPosts();
    assert.equal(repositoryCalled, true);
    assert.equal(result.data, publishedPosts);
  } finally {
    postRepository.findPublishedPosts = originalFindPublished;
  }
});

test("author can edit their own post and cannot edit another author's post", async () => {
  const originalFind = postRepository.findPostByIdWithoutPopulate;
  const originalUpdate = postRepository.updatePost;
  postRepository.findPostByIdWithoutPopulate = async () => createPost();
  postRepository.updatePost = async (id, data) => ({ ...createPost(), _id: id, ...data });
  try {
    const updated = await postService.updatePost(AUTHOR_ID, POST_ID, {
      title: "A sufficiently long post title",
      content: "This content is sufficiently long for publishing.",
      tags: "js, node",
      status: POST_STATUS.DRAFT,
    });
    assert.deepEqual(updated.data.tags, ["js", "node"]);
    await expectApiError(
      postService.updatePost(OTHER_AUTHOR_ID, POST_ID, {
        title: "A sufficiently long post title",
        content: "This content is sufficiently long for publishing.",
        tags: "",
        status: POST_STATUS.DRAFT,
      }),
      403,
    );
  } finally {
    postRepository.findPostByIdWithoutPopulate = originalFind;
    postRepository.updatePost = originalUpdate;
  }
});

test("author can delete their own post and cannot delete another author's post", async () => {
  const originalFind = postRepository.findPostByIdWithoutPopulate;
  const originalDelete = postRepository.deletePost;
  let deletedId;
  postRepository.findPostByIdWithoutPopulate = async () => createPost();
  postRepository.deletePost = async (id) => { deletedId = id; };
  try {
    await postService.deletePost(AUTHOR_ID, POST_ID);
    assert.equal(deletedId, POST_ID);
    await expectApiError(postService.deletePost(OTHER_AUTHOR_ID, POST_ID), 403);
  } finally {
    postRepository.findPostByIdWithoutPopulate = originalFind;
    postRepository.deletePost = originalDelete;
  }
});

test("draft can be published and receives publishedAt", async () => {
  const originalFind = postRepository.findPostByIdWithoutPopulate;
  const originalUpdate = postRepository.updatePost;
  let updateData;
  postRepository.findPostByIdWithoutPopulate = async () => createPost({ status: POST_STATUS.DRAFT });
  postRepository.updatePost = async (id, data) => { updateData = data; return data; };
  try {
    await postService.updatePost(AUTHOR_ID, POST_ID, {
      title: "A sufficiently long post title",
      content: "This content is sufficiently long for publishing.",
      tags: "",
      status: POST_STATUS.PUBLISHED,
    });
    assert.equal(updateData.publishedAt instanceof Date, true);
  } finally {
    postRepository.findPostByIdWithoutPopulate = originalFind;
    postRepository.updatePost = originalUpdate;
  }
});

test("published posts cannot become drafts and retain publishedAt when edited", async () => {
  const originalFind = postRepository.findPostByIdWithoutPopulate;
  const originalUpdate = postRepository.updatePost;
  const publishedAt = new Date("2024-01-01T00:00:00.000Z");
  let updateData;
  postRepository.findPostByIdWithoutPopulate = async () => createPost({ status: POST_STATUS.PUBLISHED, publishedAt });
  postRepository.updatePost = async (id, data) => { updateData = data; return data; };
  try {
    await expectApiError(postService.updatePost(AUTHOR_ID, POST_ID, {
      title: "A sufficiently long post title",
      content: "This content is sufficiently long for publishing.",
      tags: "",
      status: POST_STATUS.DRAFT,
    }), 400);
    await postService.updatePost(AUTHOR_ID, POST_ID, {
      title: "A sufficiently long post title",
      content: "This content is sufficiently long for publishing.",
      tags: "",
      status: POST_STATUS.PUBLISHED,
    });
    assert.equal("publishedAt" in updateData, false);
  } finally {
    postRepository.findPostByIdWithoutPopulate = originalFind;
    postRepository.updatePost = originalUpdate;
  }
});

test("draft edited as draft does not receive publishedAt", async () => {
  const originalFind = postRepository.findPostByIdWithoutPopulate;
  const originalUpdate = postRepository.updatePost;
  let updateData;
  postRepository.findPostByIdWithoutPopulate = async () => createPost({ status: POST_STATUS.DRAFT });
  postRepository.updatePost = async (id, data) => { updateData = data; return data; };
  try {
    await postService.updatePost(AUTHOR_ID, POST_ID, {
      title: "",
      content: "",
      tags: "",
      status: POST_STATUS.DRAFT,
    });
    assert.equal(updateData.publishedAt, null);
  } finally {
    postRepository.findPostByIdWithoutPopulate = originalFind;
    postRepository.updatePost = originalUpdate;
  }
});

test("public visibility allows published posts and rejects drafts, deleted posts, and invalid IDs", async () => {
  const originalFind = postRepository.findPostById;
  postRepository.findPostById = async () => createPost({ status: POST_STATUS.PUBLISHED });
  try {
    const visible = await postService.getPublishedPostById(POST_ID);
    assert.equal(visible.data.status, POST_STATUS.PUBLISHED);
    postRepository.findPostById = async () => createPost({ status: POST_STATUS.DRAFT });
    await expectApiError(postService.getPublishedPostById(POST_ID), 404);
    postRepository.findPostById = async () => null;
    await expectApiError(postService.getPublishedPostById(POST_ID), 404);
    await expectApiError(postService.getPublishedPostById("not-an-object-id"), 400);
  } finally {
    postRepository.findPostById = originalFind;
  }
});

test("edit flows reject invalid ObjectIds", async () => {
  await expectApiError(postService.getPostForEditing(AUTHOR_ID, "invalid-id"), 400);
  await expectApiError(postService.updatePost(AUTHOR_ID, "invalid-id", { status: POST_STATUS.DRAFT }), 400);
});

test("account deletion removes the user posts and clears the session", async () => {
  const originalFindUser = userRepository.findUserById;
  const originalDeletePosts = postRepository.deletePostsByAuthor;
  const originalDeleteUser = userRepository.deleteUser;
  let deletedPostsFor;
  let deletedUserFor;
  userRepository.findUserById = async () => ({ _id: AUTHOR_ID });
  postRepository.deletePostsByAuthor = async (id) => { deletedPostsFor = id; };
  userRepository.deleteUser = async (id) => { deletedUserFor = id; };
  try {
    await authService.deleteAccount(AUTHOR_ID);
    assert.equal(deletedPostsFor, AUTHOR_ID);
    assert.equal(deletedUserFor, AUTHOR_ID);
  } finally {
    userRepository.findUserById = originalFindUser;
    postRepository.deletePostsByAuthor = originalDeletePosts;
    userRepository.deleteUser = originalDeleteUser;
  }

  const originalDeleteAccount = authService.deleteAccount;
  authService.deleteAccount = async () => {};
  const req = { session: { user: { id: AUTHOR_ID } } };
  let redirectedTo;
  try {
    await invokeController(deleteAccount, req, { redirect: (path) => { redirectedTo = path; } });
    assert.equal(req.session, null);
    assert.equal(redirectedTo, "/login");
  } finally {
    authService.deleteAccount = originalDeleteAccount;
  }
});

test("CSRF rejects missing and invalid tokens and accepts a valid token", () => {
  const session = {};
  const res = { locals: {} };
  const request = (method, body = {}) => ({ method, body, session, get: () => undefined });
  let nextCalls = 0;
  csrfProtection(request("GET"), res, () => { nextCalls++; });
  assert.equal(nextCalls, 1);
  assert.equal(typeof res.locals.csrfToken, "string");
  assert.throws(() => csrfProtection(request("POST"), res, () => {}), (error) => error.statusCode === 403);
  assert.throws(() => csrfProtection(request("POST", { _csrf: "invalid" }), res, () => {}), (error) => error.statusCode === 403);
  csrfProtection(request("POST", { _csrf: res.locals.csrfToken }), res, () => { nextCalls++; });
  assert.equal(nextCalls, 2);
});

test("error handling preserves controlled errors and hides unexpected details", () => {
  const renders = [];
  const response = {
    headersSent: false,
    status(code) { this.statusCode = code; return this; },
    render(view, data) { renders.push({ view, data }); },
  };
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    errorHandler(new ApiError(422, "Safe validation message"), {}, response, () => {});
    errorHandler(new Error("internal database detail"), {}, response, () => {});
  } finally {
    console.error = originalConsoleError;
  }
  assert.deepEqual(renders[0], { view: "error", data: { statusCode: 422, message: "Safe validation message" } });
  assert.deepEqual(renders[1], {
    view: "error",
    data: { statusCode: 500, message: "Something went wrong. Please try again later." },
  });
});
