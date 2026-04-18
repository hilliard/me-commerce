import { Router, Request, Response } from 'express';
import { db } from '../db/db.js';
import { humans, customers } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
     res.status(400).json({ error: 'Email and password required' });
     return;
  }

  try {
    const user = await db.select()
      .from(humans)
      .leftJoin(customers, eq(humans.id, customers.humanId))
      .where(eq(humans.email, email))
      .limit(1);

    if (user.length === 0 || !user[0].customers) {
       res.status(401).json({ error: 'Invalid credentials' });
       return;
    }

    const { humans: human, customers: customer } = user[0];

    // Simple mock check (replace with bcrypt in production)
    if (password !== 'test1234' && customer.passwordHash !== 'mock-hash-123') {
       res.status(401).json({ error: 'Invalid credentials' });
       return;
    }

    const token = jwt.sign(
      { humanId: human.id, email: human.email }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );

     res.json({
      message: 'Login successful',
      token,
      user: { id: human.id, firstName: human.firstName, lastName: human.lastName, email: human.email }
    });
    return;
  } catch (error) {
    console.error(error);
     res.status(500).json({ error: 'Server error during login' });
     return;
  }
});
