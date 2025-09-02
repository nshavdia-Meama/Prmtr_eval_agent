import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// --- Schemas ---
const evaluationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt too long"),
  context: z.string().optional(),
});

const evaluationHistoryQuerySchema = z.object({
  // accept "5" or 5, clamp to [1,100], default 10
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      const n = typeof val === "number" ? val : parseInt(val ?? "10", 10);
      const safe = Number.isFinite(n) ? n : 10;
      return Math.min(Math.max(safe, 1), 100);
    }),
});

const evaluationIdParamSchema = z.object({
  id: z.string().min(1, "Evaluation ID is required"),
});

// --- Middleware ---
export const validateEvaluationRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const validated = evaluationRequestSchema.parse(req.body);
    req.body = validated; // OK to overwrite; shapes match controller types
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    } else {
      next(error);
    }
  }
};

export const validateEvaluationHistoryQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const validated = evaluationHistoryQuerySchema.parse(req.query);
    // Keep limit as a number so controllers don't need to parse again.
    // Cast to any because Express' Request["query"] is ParsedQs (strings).
    (req as any).query = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    } else {
      next(error);
    }
  }
};

export const validateEvaluationId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const validated = evaluationIdParamSchema.parse(req.params);
    req.params = validated; // fine: keeps id as string
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    } else {
      next(error);
    }
  }
};
