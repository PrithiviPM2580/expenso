import type { NextFunction, Request, Response } from "express";
import type { TypeRequest } from "../types";
import type { LoginInput, RegisterInput } from "../validations/auth.validation";
import prisma from "../utils/prisma-client";
import { AppError } from "../utils/error";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { defaultCategories } from "../utils/constants";
import { signToken } from "../utils/jwt";
import type { Prisma } from "../generated/prisma/client";

export const register = async (
  req: TypeRequest<RegisterInput>,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password, currency } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return next(new AppError(400, "User with this email already exists"));
  }

  const hasshedPassword = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password: hasshedPassword,
        currency,
      },
    });

    await tx.category.createMany({
      data: defaultCategories.map(
        (category): Prisma.CategoryCreateManyInput => ({
          ...category,
          userId: newUser.id,
          isDefault: true,
        }),
      ),
    });

    return newUser;
  });

  const token = signToken({
    id: user.id,
    email: user.email,
  });

  return res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    },
  });
};

export const login = async (
  req: TypeRequest<LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return next(new AppError(401, "Invalid email or password"));
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError(401, "Invalid email or password"));
  }

  const token = signToken({
    id: user.id,
    email: user.email,
  });

  return res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    },
  });
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
    },
  });

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  return res.status(200).json({
    status: "success",
    message: "User fetched successfully",
    data: {
      user,
    },
  });
};
