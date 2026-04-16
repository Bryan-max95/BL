import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || "family-finance-secret-key-2026";

export interface JWTPayload {
  id: number;
  username: string;
}

export function generateToken(user: JWTPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth_token')?.value;
    return token || null;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserByUsername(username: string) {
  const result = await query(
    'SELECT id, username, password, is_active, must_change_password FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

export async function getUserById(id: number) {
  const result = await query(
    'SELECT id, username, last_login, is_active, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function updateLastLogin(id: number) {
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );
}
