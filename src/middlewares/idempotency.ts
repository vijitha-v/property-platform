import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const idempotency = (req: Request, res: Response, next: NextFunction) => {
  const { email, message, property_id } = req.body;
  
  const key = crypto
    .createHash('sha256')
    .update(`${email}${message}${property_id || ''}`)
    .digest('hex');

  req.body.idempotency_key = key;
  next();
};
