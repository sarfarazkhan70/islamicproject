import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.js';
export function validate(schema) {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json(sendError('VALIDATION_ERROR', 'Input validation failed', details));
                return;
            }
            next(error);
        }
    };
}
export const validateRequest = validate;
