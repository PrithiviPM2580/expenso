import jwt from "jsonwebtoken";
import type { Payload } from "../types";

export const signToken = (
  payload: Payload,
  options?: jwt.SignOptions,
): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
    ...options,
  });
};
