import type { Request, Response, NextFunction } from 'express';


// Extend Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

/**
 * Mock authentication middleware
 * Sets req.user to a mock admin user for development/testing
 */
export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.user = { id: 1, role: 'ADMIN' };
  next();
};