import { Router } from 'express';
import { rateLimiter } from '../middlewares/rateLimiter';
import { getProperties, getPropertyBySlug, invalidateCache } from '../services/wordpressService';

const router = Router();

router.get('/properties', rateLimiter, async (req, res) => {
  try {
    const data = await getProperties();
    res.json({ success: true, data, cached: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
});

router.get('/properties/:slug', rateLimiter, async (req, res) => {
  try {
    const data = await getPropertyBySlug(req.params.slug as string);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
});

router.post('/cache/invalidate', async (req, res) => {
  try {
    const { slug } = req.body;
    await invalidateCache(slug);
    res.json({ success: true, message: 'Cache invalidated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to invalidate cache' });
  }
});

export default router;
