import ApiError from "../helpers/ApiError.js";
import userRepository from "../repositories/user.repository.js";
import { AUTH_MESSAGES } from "../constants/authMessages.js";
import { hashPassword } from "../utils/password/hashPassword.js";
import { verifyPassword } from "../utils/password/verifyPassword.js";


class AuthService {

  async registerUser(userData) {
    const { name, email, password } = userData;
    if (!name || !email || !password) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    //find existing user
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ApiError(409, AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.createUser({
      name, email, passwordHash
    });
    return {
      message: AUTH_MESSAGES.USER_REGISTERED,
      data: {
        name: user.name, email: user.email
      },
    }
  }

}

export default new AuthService();