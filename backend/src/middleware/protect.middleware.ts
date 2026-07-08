import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error";
import { verifyToken } from "../utils/jwt";
import prisma from "../utils/prisma-client";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  const header = req.headers.authorization;

  if (header?.startsWith("Bearer")) {
    token = header.split(" ")[1];
  }

  if (!token) {
    throw new AppError(
      401,
      "You are not logged in! Please log in to get access.",
    );
  }

  const decode = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: {
      id: decode.id,
    },
  });

  if (!user) {
    throw new AppError(401, "User not found");
  }

  const { createdAt, currency, password, ...authUser } = user;
  req.user = authUser;

  next();
};
