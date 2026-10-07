import ApiError from "../helpers/ApiError.js";

const errorHandler = (error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  const isKnownError = error instanceof ApiError;
  const statusCode = isKnownError ? error.statusCode : 500;
  const message = isKnownError
    ? error.message
    : "Something went wrong. Please try again later.";
  res.status(statusCode).render("error", {
    statusCode,
    message
  })
}

export default errorHandler;
