import argon2 from "argon2";

export const verifyPassword = async (password, passwordHash) => {
  return await argon2.verify(passwordHash, password);
};
