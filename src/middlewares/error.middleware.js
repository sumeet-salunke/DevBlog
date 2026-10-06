const errorHandler = (error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";
  res.status(statusCode).render("error", {
    statusCode,
    message
  })
}

export default errorHandler;