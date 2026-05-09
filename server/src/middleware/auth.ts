import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
import { customers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  
  if (!user || !user.humanId) {
    res.status(403).json({ error: 'Administrative human identity strictly required' });
    return;
  }

  try {
    const [customerRecord] = await db.select().from(customers).where(eq(customers.humanId, user.humanId)).limit(1);
    
    if (!customerRecord || !customerRecord.isAdmin) {
      res.status(403).json({ error: 'Explicit Unauthorized Zero-Trust Failure' });
      return;
    }
    next();
  } catch (e) {
    res.status(500).json({ error: 'Database Authorization Failed Structurally' });
  }
};
