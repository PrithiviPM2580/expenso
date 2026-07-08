import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate-request.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { protect } from "../middleware/protect.middleware";

const authRouter: Router = Router();

authRouter.post(
  "/register",
  validateRequest({ body: registerSchema }),
  register,
);

authRouter.post("/login", validateRequest({ body: loginSchema }), login);

authRouter.get("/me", protect, getMe);

export default authRouter;
