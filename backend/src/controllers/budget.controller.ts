import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import type { TypeRequest } from "../types";
import prisma from "../utils/prisma-client";
import type {
  BudgetParams,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "../validations/budget.validation";

export const getBudgets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const budgets = await prisma.$queryRaw`
      SELECT
        b.*,
        c.name AS category_name,
        c.icon,
        c.color,
        COALESCE(SUM(t.amount), 0) AS spent
      FROM budgets b
      JOIN categories c
        ON b.category_id = c.id
      LEFT JOIN transactions t
        ON t.category_id = b.category_id
        AND t.user_id = ${req.user!.id}
        AND t.type = 'expense'
        AND t.transaction_date >= date_trunc(b.period, CURRENT_DATE)
      WHERE b.user_id = ${req.user!.id}
      GROUP BY b.id, c.id
      ORDER BY c.name;
    `;

  if (!budgets) {
    return next(new AppError(404, "No budgets found"));
  }

  return res.status(200).json({
    status: "success",
    message: "Budgets retrieved successfully",
    data: {
      budgets,
    },
  });
};

export const createBudget = async (
  req: TypeRequest<CreateBudgetInput>,
  res: Response,
  next: NextFunction,
) => {
  const { categoryId, amount, period, startDate } = req.body;

  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const effectiveStart = startDate || monthStart;

  const budget = await prisma.budget.create({
    data: {
      categoryId,
      amount,
      period,
      startDate: effectiveStart,
      userId: req.user!.id,
    },
  });

  return res.status(201).json({
    status: "success",
    message: "Budget created successfully",
    data: {
      budget,
    },
  });
};

export const updateBudget = async (
  req: TypeRequest<UpdateBudgetInput, BudgetParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { amount, period } = req.body;

  const budget = await prisma.budget.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!budget) {
    return next(new AppError(404, "Budget not found"));
  }

  const updatedBudget = await prisma.budget.update({
    where: {
      id,
    },
    data: {
      amount: amount ?? budget.amount,
      period: period ?? budget.period,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Budget updated successfully",
    data: {
      budget: updatedBudget,
    },
  });
};

export const deleteBudget = async (
  req: TypeRequest<unknown, BudgetParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const budget = await prisma.budget.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!budget) {
    return next(new AppError(404, "Budget not found"));
  }

  await prisma.budget.delete({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Budget deleted successfully",
  });
};
