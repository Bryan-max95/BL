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
      `SELECT je.*, c.name as category_name,
        cu.username as created_by_username,
        eu.username as last_edited_by_username
       FROM joint_expenses je
       JOIN categories c ON je.category_id = c.id
       JOIN users cu ON je.created_by = cu.id
       JOIN users eu ON je.last_edited_by = eu.id
       WHERE je.deleted_at IS NULL
       ORDER BY je.date DESC
       LIMIT 100`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener gastos conjuntos' }, { status: 500 });
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
      `INSERT INTO joint_expenses (amount, category_id, description, date, created_by, last_edited_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [amount, category_id, description, date, payload.id, payload.id]
    );

    await logAudit({
      user_id: payload.id,
      action: 'CREATE',
      entity: 'joint_expense',
      entity_id: result.rows[0].id,
      new_values: { amount, category_id, description, date },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear gasto conjunto' }, { status: 500 });
  }
}
