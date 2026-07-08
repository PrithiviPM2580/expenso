import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { validateRequest } from "../middleware/validate-request.middleware";
import { protect } from "../middleware/protect.middleware";
import { asyncHandler } from "../middleware/async-handler.middleware";
import {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation";

const categoryRouter: Router = Router();

categoryRouter.get("/", protect, asyncHandler(getAllCategories));

categoryRouter.post(
  "/",
  protect,
  validateRequest({ body: createCategorySchema }),
  asyncHandler(createCategory),
);

categoryRouter.patch(
  "/:id",
  protect,
  validateRequest({ body: updateCategorySchema, params: categoryParamsSchema }),
  asyncHandler(updateCategory),
);

categoryRouter.delete(
  "/:id",
  protect,
  validateRequest({ params: categoryParamsSchema }),
  asyncHandler(deleteCategory),
);

export default categoryRouter;
