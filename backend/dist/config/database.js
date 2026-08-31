import mongoose from 'mongoose';
import { ENV } from './env.js';
export async function connectDatabase(uri = ENV.MONGODB_URI) {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: ENV.NODE_ENV !== 'production',
        });
        console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.error('[MongoDB] Connection error:', error);
        if (ENV.NODE_ENV === 'production') {
            throw error;
        }
        throw error;
    }
}
export async function disconnectDatabase() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('[MongoDB] Disconnected successfully');
    }
}
export function getDatabaseStatus() {
    const state = mongoose.connection.readyState;
    const stateNames = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return {
        isConnected: state === 1,
        readyState: state,
        stateName: stateNames[state] || 'unknown',
    };
}
