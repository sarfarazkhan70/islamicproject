import { sendError } from '../utils/apiResponse.js';
export function notFoundHandler(req, res) {
    res.status(404).json(sendError('NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} does not exist on this server.`));
}
