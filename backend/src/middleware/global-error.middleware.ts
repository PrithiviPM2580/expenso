import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof Error) {
    error = new AppError(err.message, 500);
  } else {
    error = new AppError("Something went wrong", 500);
  }

  console.error("🔥 Error:", {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
  });

  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
  });
};
