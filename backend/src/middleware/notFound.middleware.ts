import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    sendError('NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} does not exist on this server.`)
  );
}
