import argon2 from "argon2";

export const verifyPassword = async (password, passowrdHash) => {
  return await argon2.verify(passowrdHash, password);
};
