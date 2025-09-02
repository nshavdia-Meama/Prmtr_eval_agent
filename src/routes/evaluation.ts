import { Router } from "express";
import { EvaluationController } from "../controllers/evaluationController";
import {
  validateEvaluationRequest,
  validateEvaluationHistoryQuery,
  validateEvaluationId,
} from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();
const ctrl = new EvaluationController();

// Quick ping for /api
router.get("/", (_req, res) => {
  res.json({
    ok: true,
    routes: [
      "GET    /api/health",
      "POST   /api/evaluation",
      "GET    /api/evaluation/history?limit=10",
      "GET    /api/evaluation/:id",
    ],
  });
});

// ✅ Health route that does NOT hit controller/services
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Create/evaluate
router.post(
  "/evaluation",
  validateEvaluationRequest,
  asyncHandler(ctrl.evaluateQuery.bind(ctrl))
);

// History
router.get(
  "/evaluation/history",
  validateEvaluationHistoryQuery,
  asyncHandler(ctrl.getEvaluationHistory.bind(ctrl))
);

// Get by id
router.get(
  "/evaluation/:id",
  validateEvaluationId,
  asyncHandler(ctrl.getEvaluationById.bind(ctrl))
);

export default router;
