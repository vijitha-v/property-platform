import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../config/database';

export const handleCRM = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Store webhook event
    await db.query(
      `INSERT INTO webhook_events (source, payload, signature, processed)
       VALUES ($1, $2, $3, $4)`,
      ['crm', req.body, signature, false]
    );

    res.json({ success: true, message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
