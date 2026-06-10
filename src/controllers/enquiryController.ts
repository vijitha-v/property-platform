import { Request, Response } from 'express';
import { db } from '../config/database';
import { enquiryQueue } from '../queues/enquiryQueue';
import { logger } from '../config/logger';
export const create = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, property_id, idempotency_key } = req.body;

    // Check for duplicate
    const existing = await db.query(
      'SELECT id FROM enquiries WHERE idempotency_key = $1',
      [idempotency_key]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate enquiry detected'
      });
    }

    const result = await db.query(
      `INSERT INTO enquiries (name, email, phone, message, property_id, idempotency_key, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, phone, message, property_id, idempotency_key, req.ip]
    );

    const enquiry = result.rows[0];

    // Add to queue for async CRM sync
    await enquiryQueue.add('crm-sync', { enquiryId: enquiry.id });

    res.status(201).json({ success: true, data: enquiry });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM enquiries WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query: string;
    let params: any[];

    if (status) {
      query = `SELECT *, COUNT(*) OVER() as total_count 
               FROM enquiries 
               WHERE status = $1
               ORDER BY created_at DESC 
               LIMIT $2 OFFSET $3`;
      params = [status, limit, offset];
    } else {
      query = `SELECT *, COUNT(*) OVER() as total_count 
               FROM enquiries 
               ORDER BY created_at DESC 
               LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const result = await db.query(query, params);
    const total = result.rows.length > 0 ? Number(result.rows[0].total_count) : 0;

    res.json({
      success: true,
      data: result.rows.map(({ total_count, ...row }) => row),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    logger.error('List enquiries error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};