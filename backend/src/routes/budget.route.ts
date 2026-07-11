import { Router } from "express";
import { validateRequest } from "../middleware/validate-request.middleware";
import { protect } from "../middleware/protect.middleware";
import { asyncHandler } from "../middleware/async-handler.middleware";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../controllers/budget.controller";
import {
  budgetParamsSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "../validations/budget.validation";

const budgetRouter: Router = Router();

budgetRouter.get("/", protect, asyncHandler(getBudgets));

budgetRouter.post(
  "/",
  protect,
  validateRequest({ body: createBudgetSchema }),
  asyncHandler(createBudget),
);

budgetRouter.patch(
  "/:id",
  protect,
  validateRequest({ body: updateBudgetSchema, params: budgetParamsSchema }),
  asyncHandler(updateBudget),
);

budgetRouter.delete(
  "/:id",
  protect,
  validateRequest({ params: budgetParamsSchema }),
  asyncHandler(deleteBudget),
);

export default budgetRouter;
