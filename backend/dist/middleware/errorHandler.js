import { sendError } from '../utils/apiResponse.js';
export function errorHandler(err, _req, res, _next) {
    console.error('[Unhandled Error]:', err);
    res.status(500).json(sendError('INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred.'));
}
