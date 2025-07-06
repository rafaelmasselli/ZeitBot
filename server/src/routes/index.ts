import { Router } from "express";
import { healthRouter } from "./health.routes";

const router = Router();

router.use("/health", healthRouter);

// router.use('/api/v1/resource', resourceRouter);

export default router;
