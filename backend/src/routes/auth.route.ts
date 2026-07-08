import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate-request.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { protect } from "../middleware/protect.middleware";
import { asyncHandler } from "../middleware/async-handler.middleware";

const authRouter: Router = Router();

authRouter.post(
  "/register",
  validateRequest({ body: registerSchema }),
  asyncHandler(register),
);

authRouter.post(
  "/login",
  validateRequest({ body: loginSchema }),
  asyncHandler(login),
);

authRouter.get("/me", protect, asyncHandler(getMe));

export default authRouter;
