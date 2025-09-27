import jwt from 'jsonwebtoken';
import { ENV } from "../config/env-config.ts";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  studentId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Generate access token
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRE,
    issuer: 'payment-verification-system',
    audience: 'payment-verification-users'
  });
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    ENV.JWT_REFRESH_SECRET as string,
    {
      expiresIn: ENV.JWT_REFRESH_EXPIRE,
      issuer: 'payment-verification-system',
      audience: 'payment-verification-users'
    }
  );
};

// Generate both tokens
export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload.userId)
  };
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET, {
      issuer: 'payment-verification-system',
      audience: 'payment-verification-users'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET, {
      issuer: 'payment-verification-system',
      audience: 'payment-verification-users'
    }) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return { userId: decoded.userId };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format');
  }
  return authHeader.substring(7);
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
