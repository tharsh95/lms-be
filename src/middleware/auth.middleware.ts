import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './error.middleware';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      req.user = {
        email: decoded.id // Since we stored email as id in the token
        
      };
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};