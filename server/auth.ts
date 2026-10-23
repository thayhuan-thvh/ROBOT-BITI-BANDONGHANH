import crypto from 'crypto';
import { User, UserRole, AccountStatus } from '../src/types/auth';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'biti_infor_secret_key_2026_gdpt_916147571335';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

/**
 * Hash password with salt using PBKDF2 / scrypt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return { hash: derivedKey.toString('hex'), salt };
}

/**
 * Verify password against salt and hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    if (keyBuffer.length !== hashBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate a signed session token
 */
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    role: user.role,
    status: user.status || 'approved',
    email: user.email,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifyToken(token: string): { userId: string; role: UserRole; status: AccountStatus; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      userId: payload.userId,
      role: payload.role as UserRole,
      status: (payload.status || 'approved') as AccountStatus,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

/**
 * Strip sensitive credentials before sending to client
 */
export function sanitizeUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status || 'approved',
    school: user.school,
    rejectionReason: user.rejectionReason,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    approvedAt: user.approvedAt,
    approvedBy: user.approvedBy,
  };
}
