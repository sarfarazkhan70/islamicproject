import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Unhandled Error]:', err);
  res.status(500).json(sendError('INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred.'));
}
