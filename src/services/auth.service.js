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

  async loginUser(loginData) {
    const { email, password } = loginData;
    if (!email || !password) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    //find user by email
    const user = await userRepository.findUserByEmail(email, true);
    if (!user) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_CREDENTIALS);


    }
    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,

      }
    }
  }

}

export default new AuthService();