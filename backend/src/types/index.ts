import { type Request } from "express";
import type { Category } from "../generated/prisma/client";
type CategoryType = "income" | "expense";

export type DefaultCategories = Pick<
  Category,
  "name" | "type" | "icon" | "color"
>[];

export type TypeRequest<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown,
> = Request<TParams, unknown, TBody, TQuery>;

export interface Payload {
  id: number;
  email: string;
}
