import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import authRouter from "./auth.route";
import categoryRouter from "./category.route";
import transcationRouter from "./transcation.route";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

router.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

router.use("/api/auth", authRouter);
router.use("/api/categories", categoryRouter);
router.use("/api/transactions", transcationRouter);

router.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found.",
  });
});

export default router;
