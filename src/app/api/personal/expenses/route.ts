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
      `SELECT pe.*, u.username, c.name as category_name,
        ru.username as registered_by_username
       FROM personal_expenses pe
       JOIN users u ON pe.user_id = u.id
       JOIN users ru ON pe.registered_by = ru.id
       JOIN categories c ON pe.category_id = c.id
       WHERE pe.user_id = $1
       ORDER BY pe.date DESC
       LIMIT 100`,
      [payload.id]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener gastos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ message: 'Token inválido' }, { status: 401 });

  try {
    const { user_id, amount, category_id, description, date } = await request.json();

    const result = await query(
      `INSERT INTO personal_expenses (user_id, registered_by, amount, category_id, description, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, payload.id, amount, category_id, description, date]
    );

    await logAudit({
      user_id: payload.id,
      action: 'CREATE',
      entity: 'personal_expense',
      entity_id: result.rows[0].id,
      new_values: { user_id, amount, category_id, description, date },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear gasto' }, { status: 500 });
  }
}
