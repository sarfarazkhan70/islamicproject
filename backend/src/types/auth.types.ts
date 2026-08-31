import { Request } from 'express';
import { Types } from 'mongoose';

export interface TokenPayload {
  userId: string;
  email?: string;
  phone?: string;
  isAnonymous?: boolean;
}

export interface AuthUserContext {
  id: string;
  _id: Types.ObjectId;
  email?: string;
  phone?: string;
  name?: string;
  isAnonymous: boolean;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserContext;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponseData {
  user: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
    isAnonymous: boolean;
    createdAt: Date;
  };
  tokens: AuthTokens;
}
