import { Router } from 'express';
import { rateLimiter } from '../middlewares/rateLimiter';
import * as ctrl from '../controllers/webhookController';

const router = Router();

router.post('/crm', rateLimiter, ctrl.handleCRM);

export default router;
