import { z } from "zod";

export const budgetParamsSchema = z.object({
  id: z.coerce.number().int().positive("Id must be a positive integer"),
});

export const createBudgetSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: z.number().positive(),
  period: z.enum(["weekly", "monthly"]).default("monthly"),
  startDate: z.string().optional(),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive().optional(),
  period: z.enum(["weekly", "monthly"]).optional(),
});

export type BudgetParams = z.infer<typeof budgetParamsSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
