import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import type { TypeRequest } from "../types";
import type {
  CreateTransactionInput,
  TransactionParams,
  TransactionQuery,
  UpdateTransactionInput,
} from "../validations/transcation.validation";
import type { Prisma } from "../generated/prisma/client";
import prisma from "../utils/prisma-client";

export const getAllTransactions = async (
  req: TypeRequest<unknown, unknown, TransactionQuery>,
  res: Response,
  next: NextFunction,
) => {
  const { startDate, endDate, categoryId, type, search, limit, offset } =
    req.query;

  const where: Prisma.TransactionWhereInput = {
    userId: req.user!.id,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.transactionDate = {};

    if (startDate) {
      where.transactionDate.gte = new Date(startDate);
    }

    if (endDate) {
      where.transactionDate.lte = new Date(endDate);
    }
  }

  if (search) {
    where.OR = [
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        notes: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
        },
      },
    },
    orderBy: [
      {
        transactionDate: "desc",
      },
      { id: "desc" },
    ],
    take: limit,
    skip: offset,
  });

  return res.status(200).json({
    status: "success",
    message: "Transactions retrieved successfully",
    data: {
      transactions,
    },
  });
};

export const createTransaction = async (
  req: TypeRequest<CreateTransactionInput>,
  res: Response,
  next: NextFunction,
) => {
  const { categoryId, amount, type, description, notes, transactionDate } =
    req.body;

  const transcation = await prisma.transaction.create({
    data: {
      userId: req.user!.id,
      categoryId,
      amount,
      type,
      description,
      notes,
      transactionDate: new Date(transactionDate),
    },
  });

  return res.status(201).json({
    status: "success",
    message: "Transaction created successfully",
    data: {
      transcation,
    },
  });
};

export const getTransactionById = async (
  req: TypeRequest<unknown, TransactionParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const transcation = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
        },
      },
    },
  });

  if (!transcation) {
    return next(new AppError(404, "Transaction not found"));
  }

  return res.status(200).json({
    status: "success",
    message: "Transaction retrieved successfully",
    data: {
      transcation,
    },
  });
};

export const updateTransaction = async (
  req: TypeRequest<UpdateTransactionInput, TransactionParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { categoryId, amount, type, description, notes, transactionDate } =
    req.body;

  const transcation = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!transcation) {
    return next(new AppError(404, "Transaction not found"));
  }

  const updatedTransaction = await prisma.transaction.update({
    where: {
      id,
    },
    data: {
      categoryId,
      amount,
      type,
      description,
      notes,
      transactionDate: transactionDate ? new Date(transactionDate) : undefined,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Transaction updated successfully",
    data: {
      transaction: updatedTransaction,
    },
  });
};

export const deleteTranscation = async (
  req: TypeRequest<unknown, TransactionParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const transcation = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!transcation) {
    return next(new AppError(404, "Transaction not found"));
  }

  await prisma.transaction.delete({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Transaction deleted successfully",
  });
};
