import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth';

export interface AuthRequest extends Request {
  worker?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.worker = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requirePHC = (req: AuthRequest, res: Response, next: NextFunction): any => {
  if (!req.worker || !req.worker.role) {
    return res.status(403).json({ error: 'Forbidden: Missing role' });
  }
  
  if (req.worker.role !== 'PHC_ADMIN' && req.worker.role !== 'PHC_OFFICER') {
    return res.status(403).json({ error: 'Forbidden: Requires PHC access' });
  }

  next();
};
