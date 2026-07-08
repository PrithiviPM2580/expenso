import type { NextFunction, Request, Response } from "express";
import prisma from "../utils/prisma-client";
import { AppError } from "../utils/error";
import type { TypeRequest } from "../types";
import type {
  CategoryParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validations/category.validation";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categories = await prisma.category.findMany({
    where: {
      userId: req.user!.id,
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  if (!categories) {
    return next(new AppError(404, "No categories found"));
  }

  return res.status(200).json({
    status: "success",
    message: " Categories retrieved successfully",
    data: {
      categories,
    },
  });
};

export const createCategory = async (
  req: TypeRequest<CreateCategoryInput>,
  res: Response,
  next: NextFunction,
) => {
  const { name, type, icon, color } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      type,
      icon,
      color,
      isDefault: false,
      userId: req.user!.id,
    },
  });

  return res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: {
      category,
    },
  });
};

export const updateCategory = async (
  req: TypeRequest<UpdateCategoryInput, CategoryParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  const updateCategory = await prisma.category.update({
    where: {
      id,
    },
    data: {
      name,
      color,
      icon,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    data: {
      category: updateCategory,
    },
  });
};

export const deleteCategory = async (
  req: TypeRequest<unknown, CategoryParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
};
