import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "NotFound",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected server error";
  // eslint-disable-next-line no-console
  console.error("[unhandled error]", err);
  res.status(500).json({
    error: "InternalServerError",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : message,
  });
}
