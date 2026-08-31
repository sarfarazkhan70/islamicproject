import { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

export function sendError(code: string, message: string, details?: unknown): ApiResponse {
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
