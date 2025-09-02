import { Request, Response } from "express";
import { EvaluationService } from "../services/evaluationService";
import { EvaluationRequest } from "../types/evaluation";

export class EvaluationController {
  private evaluationService: EvaluationService;

  constructor() {
    this.evaluationService = new EvaluationService();
  }

  // POST /api/evaluation
  async evaluateQuery(req: Request, res: Response): Promise<void> {
    try {
      // validated by validateEvaluationRequest
      const { prompt, context } = req.body as EvaluationRequest;

      const result = await this.evaluationService.evaluateQuery({ prompt, context });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Controller error (evaluateQuery):", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // GET /api/evaluation/history
  async getEvaluationHistory(req: Request, res: Response): Promise<void> {
    try {
      // validated & transformed by validateEvaluationHistoryQuery (limit is a number there)
      const { limit } = req.query as unknown as { limit?: number };
      const effectiveLimit = typeof limit === "number" ? limit : 10;

      const results = await this.evaluationService.getEvaluationHistory(effectiveLimit);

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error) {
      console.error("Controller error (getEvaluationHistory):", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // GET /api/evaluation/:id
  async getEvaluationById(req: Request, res: Response): Promise<void> {
    try {
      // validated by validateEvaluationId
      const { id } = req.params as { id: string };

      const result = await this.evaluationService.getEvaluationById(id);
      if (!result) {
        res.status(404).json({ success: false, error: "Evaluation not found" });
        return;
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Controller error (getEvaluationById):", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // GET /api/health
  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: "Prmtr Evaluation Agent is healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    } catch {
      res.status(500).json({ success: false, error: "Health check failed" });
    }
  }
}

export default EvaluationController;
