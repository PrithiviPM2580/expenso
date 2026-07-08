import jwt from "jsonwebtoken";
import type { Payload } from "../types";
import { AppError } from "./error";

export const signToken = (
  payload: Payload,
  options?: jwt.SignOptions,
): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
    ...options,
  });
};

export const verifyToken = (token: string): Payload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as Payload;
  } catch (error) {
    throw new AppError(401, "Invalid token");
  }
};
