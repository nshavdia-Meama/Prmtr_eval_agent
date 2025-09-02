import { Request, Response, NextFunction, RequestHandler } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (
  message: string,
  statusCode = 400,
  isOperational = true
): AppError => {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.isOperational = isOperational;
  return err;
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default fallbacks
  const statusCode = error.statusCode && Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;

  const message = error.message || "Internal Server Error";

  // Useful server-side log (do not expose in response)
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // If another middleware already started the response, delegate
  if (res.headersSent) {
    return next(error);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(createError(`Route ${req.originalUrl} not found`, 404));
};

/**
 * Wrap async route handlers to forward exceptions to errorHandler.
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = <T extends RequestHandler>(fn: T): T => {
  return ( (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)
  ) as unknown as T;
};
