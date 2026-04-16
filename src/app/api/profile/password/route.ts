import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [payload.id]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, payload.id]);

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('PUT /api/profile/password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 400 });
  }
}
