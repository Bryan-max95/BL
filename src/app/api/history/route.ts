import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ message: 'Token inválido' }, { status: 401 });

  try {
    const result = await query(
      `SELECT al.*, u.username
       FROM audit_logs al
       JOIN users u ON u.id = al.user_id
       WHERE al.user_id = $1 OR al.entity IN ('joint_expenses', 'wedding_expenses')
       ORDER BY al.created_at DESC
       LIMIT 1000`,
      [payload.id]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 400 });
  }
}
