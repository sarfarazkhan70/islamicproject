import { sendError } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';
export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
export function errorHandler(err, _req, res, _next) {
    const isProd = ENV.NODE_ENV === 'production';
    let statusCode = err.statusCode || 500;
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'An unexpected server error occurred.';
    let details = err.details;
    // Handle Mongoose Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_RESOURCE';
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `A resource with that ${field} already exists.`;
        details = err.keyValue;
    }
    // Handle Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        code = 'INVALID_ID_FORMAT';
        message = `Invalid format for field: ${err.path}`;
    }
    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = 'Database validation failed';
        details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }
    // Handle JSON Syntax Error in request body
    if (err instanceof SyntaxError && 'body' in err) {
        statusCode = 400;
        code = 'INVALID_JSON';
        message = 'Malformed JSON payload in request body';
    }
    if (!isProd && statusCode === 500) {
        console.error('[Server Error Debug]:', err);
    }
    res.status(statusCode).json(sendError(code, message, details));
}
