import User from "../models/User.js";

class UserRepository {
  async createUser(userData) {
    return User.create(userData);
  }

  async findUserByEmail(email, includePassword = false) {
    if (includePassword) {
      return User.findOne({ email }).select("+passwordHash");
    }
    return User.findOne({ email });
  }

  async findUserById(userId, includePassword = false) {
    if (includePassword) {
      return User.findById(userId).select("+passwordHash");
    }
    return User.findById(userId);
  }

}

export default new UserRepository();