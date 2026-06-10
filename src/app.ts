import express from 'express';
import wordpressRoutes from './routes/wordpress';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/database';
import { redis } from './config/redis';
import enquiryRoutes from './routes/enquiry';
import webhookRoutes from './routes/webhook';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    const redisPing = await redis.ping();
    res.json({
      status: 'ok',
      database: 'connected',
      redis: redisPing === 'PONG' ? 'connected' : 'error',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
});

// Routes
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/wp', wordpressRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
