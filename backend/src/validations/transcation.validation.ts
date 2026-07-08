import { z } from "zod";

export const transactionQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  type: z.enum(["income", "expense"]).optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const transactionParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createTransactionSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  transactionDate: z.iso.datetime(),
});

export const updateTransactionSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  description: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  transactionDate: z.iso.datetime().optional(),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionParams = z.infer<typeof transactionParamsSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
