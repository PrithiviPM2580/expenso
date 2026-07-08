import { z } from "zod";

export const categoryParamsSchema = z.object({
  id: z.coerce.number().int().positive("Id must be a positive integer"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["income", "expense"]),
  icon: z.string().max(50).optional(),
  color: z.string().max(7).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(7).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryParams = z.infer<typeof categoryParamsSchema>;
