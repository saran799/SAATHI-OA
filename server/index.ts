import express from 'express';
import cors from 'cors';
import authRoutes from './auth';
import syncRoutes from './sync';
import ttsRoutes from './tts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes); // which handles patients and records
app.use('/api/tts', ttsRoutes);

import { prisma } from './db';

app.get('/api/health', async (req, res) => {
  try {
    // Check database connection by querying a simple statement
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
