import { Router, Request, Response } from 'express';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined in production.');
  process.exit(1);
}
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_dev_only';

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    let worker = await prisma.worker.findUnique({ where: { username } });

    if (!worker) {
      // For demo purposes, automatically create the worker if they don't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      worker = await prisma.worker.create({
        data: {
          username,
          passwordHash: hashedPassword,
          name: username,
        }
      });
    } else {
      const isValid = await bcrypt.compare(password, worker.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const token = jwt.sign({ id: worker.id, username: worker.username, role: worker.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, worker: { id: worker.id, name: worker.name, username: worker.username, role: worker.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/change-password', async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Missing username or newPassword' });
    }
    const worker = await prisma.worker.findUnique({ where: { username } });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.worker.update({
      where: { username },
      data: { passwordHash: hashedPassword }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
