import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ message: 'Token inválido' }, { status: 401 });

  try {
    const result = await query(
      `SELECT pi.*, u.username, c.name as category_name 
       FROM personal_incomes pi
       JOIN users u ON pi.user_id = u.id
       JOIN categories c ON pi.category_id = c.id
       WHERE pi.user_id = $1
       ORDER BY pi.date DESC
       LIMIT 100`,
      [payload.id]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener ingresos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ message: 'Token inválido' }, { status: 401 });

  try {
    const { amount, category_id, description, date } = await request.json();

    const result = await query(
      `INSERT INTO personal_incomes (user_id, amount, category_id, description, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [payload.id, amount, category_id, description, date]
    );

    await logAudit({
      user_id: payload.id,
      action: 'CREATE',
      entity: 'personal_income',
      entity_id: result.rows[0].id,
      new_values: { amount, category_id, description, date },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear ingreso' }, { status: 500 });
  }
}
