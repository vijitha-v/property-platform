import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateEnquiry = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('message').trim().notEmpty().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('property_id').optional().trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
