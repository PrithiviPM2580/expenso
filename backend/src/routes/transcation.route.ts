import { Router } from "express";
import {
  createTransaction,
  deleteTranscation,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from "../controllers/transcation.controller";
import { validateRequest } from "../middleware/validate-request.middleware";
import { protect } from "../middleware/protect.middleware";
import { asyncHandler } from "../middleware/async-handler.middleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionParamsSchema,
  transactionQuerySchema,
} from "../validations/transcation.validation";

const transcationRouter: Router = Router();

transcationRouter.get(
  "/",
  protect,
  validateRequest({ query: transactionQuerySchema }),
  asyncHandler(getAllTransactions),
);

transcationRouter.get(
  "/:id",
  protect,
  validateRequest({ params: transactionParamsSchema }),
  asyncHandler(getTransactionById),
);

transcationRouter.post(
  "/",
  protect,
  validateRequest({ body: createTransactionSchema }),
  asyncHandler(createTransaction),
);

transcationRouter.patch(
  "/:id",
  protect,
  validateRequest({
    body: updateTransactionSchema,
    params: transactionParamsSchema,
  }),
  asyncHandler(updateTransaction),
);

transcationRouter.delete(
  "/:id",
  protect,
  validateRequest({ params: transactionParamsSchema }),
  asyncHandler(deleteTranscation),
);

export default transcationRouter;
