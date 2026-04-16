import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const result = await query('SELECT * FROM wedding_budget LIMIT 1');
    const spent = await query('SELECT COALESCE(SUM(amount), 0) as total FROM wedding_expenses');
    
    return NextResponse.json({
      budget: result.rows[0] || null,
      spent: spent.rows[0].total,
      remaining: result.rows[0] ? result.rows[0].total_budget - spent.rows[0].total : 0,
      percentage: result.rows[0] ? (spent.rows[0].total / result.rows[0].total_budget) * 100 : 0
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener presupuesto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ message: 'Token inválido' }, { status: 401 });

  try {
    const { total_budget, budget_currency, event_date, notes } = await request.json();
    
    const existing = await query('SELECT * FROM wedding_budget LIMIT 1');
    
    let result;
    if (existing.rows.length === 0) {
      result = await query(
        `INSERT INTO wedding_budget (total_budget, budget_currency, event_date, notes)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [total_budget, budget_currency, event_date, notes]
      );
    } else {
      result = await query(
        `UPDATE wedding_budget SET total_budget=$1, budget_currency=$2, event_date=$3, notes=$4
         WHERE id=$5 RETURNING *`,
        [total_budget, budget_currency, event_date, notes, existing.rows[0].id]
      );
    }

    await logAudit({
      user_id: payload.id,
      action: 'UPDATE',
      entity: 'wedding_budget',
      entity_id: result.rows[0].id,
      old_values: existing.rows[0] || null,
      new_values: { total_budget, budget_currency, event_date, notes },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar presupuesto' }, { status: 500 });
  }
}
