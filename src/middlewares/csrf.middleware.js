import crypto from "crypto";
import ApiError from "../helpers/ApiError.js";

const CSRF_TOKEN_LENGTH = 32;

const getOrCreateCsrfToken = (req) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  }
  return req.session.csrfToken;
};

const csrfProtection = (req, res, next) => {
  const csrfToken = getOrCreateCsrfToken(req);
  res.locals.csrfToken = csrfToken;

  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const submittedToken = req.body?._csrf || req.get("x-csrf-token");
  if (!submittedToken || typeof submittedToken !== "string") {
    throw new ApiError(403, "Invalid CSRF token.");
  }

  const expectedToken = Buffer.from(csrfToken);
  const providedToken = Buffer.from(submittedToken);
  if (
    expectedToken.length !== providedToken.length ||
    !crypto.timingSafeEqual(expectedToken, providedToken)
  ) {
    throw new ApiError(403, "Invalid CSRF token.");
  }

  next();
};

export default csrfProtection;
