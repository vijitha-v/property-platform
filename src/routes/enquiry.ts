import { Router } from 'express';
import { rateLimiter, strictRateLimiter } from '../middlewares/rateLimiter';
import { validateEnquiry } from '../middlewares/validators';
import { idempotency } from '../middlewares/idempotency';
import { cacheMiddleware } from '../middlewares/cache';
import * as ctrl from '../controllers/enquiryController';

const router = Router();

router.post('/', strictRateLimiter, validateEnquiry, idempotency, ctrl.create);
router.get('/:id', rateLimiter, cacheMiddleware(60), ctrl.getById);
router.get('/', rateLimiter, cacheMiddleware(30), ctrl.list);

export default router;