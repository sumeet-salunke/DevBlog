import argon2 from "argon2";

export const hashPassword = async (password) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
  });
};
