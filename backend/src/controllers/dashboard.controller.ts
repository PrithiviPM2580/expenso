import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { Prisma } from "../generated/prisma/client";
import prisma from "../utils/prisma-client";

interface SummaryResult {
  income_this_month: Prisma.Decimal;
  expense_this_month: Prisma.Decimal;
  income_last_month: Prisma.Decimal;
  expense_last_month: Prisma.Decimal;
}

interface CategoryBreakdownResult {
  category_id: number;
  name: string;
  icon: string | null;
  color: string | null;
  total_spent: Prisma.Decimal;
  transaction_count: bigint;
}

interface MonthlyOverviewResult {
  month: string;
  income: Prisma.Decimal;
  expense: Prisma.Decimal;
}

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;

  const result = await prisma.$queryRaw<SummaryResult[]>`
      WITH monthly_data AS (
        SELECT
          date_trunc('month', transaction_date) AS month,
          type,
          SUM(amount) AS total
        FROM transactions
        WHERE user_id = ${userId}
          AND transaction_date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        GROUP BY 1, 2
      )
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN month = date_trunc('month', CURRENT_DATE)
                AND type = 'income'
              THEN total
            END
          ),
          0
        ) AS income_this_month,

        COALESCE(
          SUM(
            CASE
              WHEN month = date_trunc('month', CURRENT_DATE)
                AND type = 'expense'
              THEN total
            END
          ),
          0
        ) AS expense_this_month,

        COALESCE(
          SUM(
            CASE
              WHEN month = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                AND type = 'income'
              THEN total
            END
          ),
          0
        ) AS income_last_month,

        COALESCE(
          SUM(
            CASE
              WHEN month = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                AND type = 'expense'
              THEN total
            END
          ),
          0
        ) AS expense_last_month
      FROM monthly_data;
    `;

  const data = result[0];

  if (!data) {
    return next(new AppError(404, "No data found for the user"));
  }

  const incomeThisMonth = Number(data?.income_this_month);
  const expenseThisMonth = Number(data?.expense_this_month);
  const incomeLastMonth = Number(data?.income_last_month);
  const expenseLastMonth = Number(data?.expense_last_month);

  const balance = incomeThisMonth - expenseThisMonth;

  const savingsRate =
    incomeThisMonth > 0
      ? Number(((balance / incomeThisMonth) * 100).toFixed(1))
      : 0;

  const pcChange = (oldValue: number, newValue: number): number => {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }

    return Number((((newValue - oldValue) / oldValue) * 100).toFixed(1));
  };

  return res.status(200).json({
    status: "success",
    data: {
      income_this_month: incomeThisMonth,
      expense_this_month: expenseThisMonth,
      income_last_month: incomeLastMonth,
      expense_last_month: expenseLastMonth,
      balance,
      savings_rate: savingsRate,
      income_change_pc: pcChange(incomeLastMonth, incomeThisMonth),
      expense_change_pc: pcChange(expenseLastMonth, expenseThisMonth),
    },
  });
};

export const getCategoryBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;

  const result = await prisma.$queryRaw<CategoryBreakdownResult[]>`
      SELECT
        c.id AS category_id,
        c.name,
        c.icon,
        c.color,
        SUM(t.amount) AS total_spent,
        COUNT(t.id) AS transaction_count
      FROM transactions t
      JOIN categories c
        ON t.category_id = c.id
      WHERE t.user_id = ${userId}
        AND t.type = 'expense'
        AND date_trunc('month', t.transaction_date) =
            date_trunc('month', CURRENT_DATE)
      GROUP BY
        c.id,
        c.name,
        c.icon,
        c.color
      ORDER BY total_spent DESC;
    `;

  const data = result.map((category) => ({
    categoryId: category.category_id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    totalSpent: Number(category.total_spent),
    transactionCount: Number(category.transaction_count),
  }));

  if (!data || data.length === 0) {
    return next(
      new AppError(404, "No category breakdown data found for the user"),
    );
  }

  return res.status(200).json({
    status: "success",
    data: {
      categories: data,
    },
  });
};

export const getMonthlyTrend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;

  const result = await prisma.$queryRaw<MonthlyOverviewResult[]>`
      SELECT
        TO_CHAR(
          date_trunc('month', transaction_date),
          'Mon YYYY'
        ) AS month,
        COALESCE(
          SUM(
            CASE
              WHEN type = 'income' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS income,
        COALESCE(
          SUM(
            CASE
              WHEN type = 'expense' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS expense
      FROM transactions
      WHERE user_id = ${userId}
        AND transaction_date >= date_trunc('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY date_trunc('month', transaction_date)
      ORDER BY date_trunc('month', transaction_date) ASC;
    `;
};
