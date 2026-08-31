export function sendSuccess(data) {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        },
    };
}
export function sendError(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        },
    };
}
