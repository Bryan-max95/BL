import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { cookies } from 'next/headers';

// Helper function to extract IP address
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const xClientIp = request.headers.get('x-client-ip');
  
  return forwarded?.split(',')[0].trim() || realIp || xClientIp || 'unknown';
}

export async function GET() {
  try {
    const result = await query(
      `SELECT we.*, cat.name as category_name, u.username
       FROM wedding_expenses we
       JOIN categories cat ON cat.id = we.category_id
       JOIN users u ON u.id = we.registered_by
       ORDER BY we.date DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wedding expenses' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.json();
    const { amount, category_id, description, date } = data;

    if (!amount || !category_id || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO wedding_expenses (budget_id, category_id, amount, registered_by, date, description)
       VALUES (1, $1, $2, $3, $4, $5)
       RETURNING *`,
      [category_id, amount, payload.id, date, description || null]
    );

    await logAudit({
      user_id: payload.id,
      action: 'create',
      entity: 'wedding_expenses',
      entity_id: result.rows[0].id,
      old_values: null,
      new_values: result.rows[0],
      ip_address: getClientIp(request),
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/wedding/expenses error:', error);
    return NextResponse.json({ error: 'Failed to create wedding expense' }, { status: 400 });
  }
}
