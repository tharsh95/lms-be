import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found error
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

// Bad request error
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(400, message);
  }
}

// Unauthorized error
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

// Forbidden error
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`Error: ${err.message}`);

  // Define error status code and message
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Not found middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Not found - ${req.originalUrl}`));
};

// Only use named exports
// No default export - use named exports only
