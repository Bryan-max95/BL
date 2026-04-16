import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

const PERIOD_TO_MONTHS: Record<string, number> = {
  '1month': 1,
  '3months': 3,
  '6months': 6,
  '1year': 12,
};

const PERIOD_LABELS: Record<string, string> = {
  '1month': 'Ultimo mes',
  '3months': 'Ultimos 3 meses',
  '6months': 'Ultimos 6 meses',
  '1year': 'Ultimo ano',
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
  }

  try {
    const userId = payload.id;
    const period = request.nextUrl.searchParams.get('period') || '3months';
    const months = PERIOD_TO_MONTHS[period] || PERIOD_TO_MONTHS['3months'];

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - months);

    const startDateSql = startDate.toISOString().split('T')[0];
    const endDateSql = endDate.toISOString().split('T')[0];

    const summaryResult = await query(
      `
        WITH personal_income AS (
          SELECT COALESCE(SUM(amount), 0)::numeric AS total
          FROM personal_incomes
          WHERE user_id = $1 AND date BETWEEN $2 AND $3
        ),
        personal_expense AS (
          SELECT COALESCE(SUM(amount), 0)::numeric AS total
          FROM personal_expenses
          WHERE user_id = $1 AND date BETWEEN $2 AND $3
        ),
        joint_expense AS (
          SELECT COALESCE(SUM(amount), 0)::numeric AS total
          FROM joint_expenses
          WHERE created_by = $1 AND deleted_at IS NULL AND date BETWEEN $2 AND $3
        ),
        wedding_expense AS (
          SELECT COALESCE(SUM(amount), 0)::numeric AS total
          FROM wedding_expenses
          WHERE date BETWEEN $2 AND $3
        )
        SELECT
          (SELECT total FROM personal_income) AS total_income,
          (SELECT total FROM personal_expense) AS personal_expenses,
          (SELECT total FROM joint_expense) AS joint_expenses,
          (SELECT total FROM wedding_expense) AS wedding_expenses
      `,
      [userId, startDateSql, endDateSql]
    );

    const summaryRow = summaryResult.rows[0];
    const totalIncome = Number(summaryRow.total_income || 0);
    const totalPersonalExpenses = Number(summaryRow.personal_expenses || 0);
    const totalJointExpenses = Number(summaryRow.joint_expenses || 0);
    const totalWeddingExpenses = Number(summaryRow.wedding_expenses || 0);
    const totalExpenses = totalPersonalExpenses + totalJointExpenses + totalWeddingExpenses;
    const netBalance = totalIncome - totalExpenses;
    const availableToSave = totalIncome - (totalPersonalExpenses + totalJointExpenses);
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

    const monthlyTrendResult = await query(
      `
        WITH combined AS (
          SELECT DATE_TRUNC('month', date)::date AS month, amount::numeric AS income, 0::numeric AS personal_expenses, 0::numeric AS joint_expenses, 0::numeric AS wedding_expenses
          FROM personal_incomes
          WHERE user_id = $1 AND date BETWEEN $2 AND $3
          UNION ALL
          SELECT DATE_TRUNC('month', date)::date AS month, 0::numeric, amount::numeric, 0::numeric, 0::numeric
          FROM personal_expenses
          WHERE user_id = $1 AND date BETWEEN $2 AND $3
          UNION ALL
          SELECT DATE_TRUNC('month', date)::date AS month, 0::numeric, 0::numeric, amount::numeric, 0::numeric
          FROM joint_expenses
          WHERE created_by = $1 AND deleted_at IS NULL AND date BETWEEN $2 AND $3
          UNION ALL
          SELECT DATE_TRUNC('month', date)::date AS month, 0::numeric, 0::numeric, 0::numeric, amount::numeric
          FROM wedding_expenses
          WHERE date BETWEEN $2 AND $3
        )
        SELECT
          month,
          COALESCE(SUM(income), 0)::numeric AS income,
          COALESCE(SUM(personal_expenses), 0)::numeric AS personal_expenses,
          COALESCE(SUM(joint_expenses), 0)::numeric AS joint_expenses,
          COALESCE(SUM(wedding_expenses), 0)::numeric AS wedding_expenses
        FROM combined
        GROUP BY month
        ORDER BY month ASC
      `,
      [userId, startDateSql, endDateSql]
    );

    const monthlyTrend = monthlyTrendResult.rows.map((row) => {
      const income = Number(row.income || 0);
      const personalExpenses = Number(row.personal_expenses || 0);
      const jointExpenses = Number(row.joint_expenses || 0);
      const weddingExpenses = Number(row.wedding_expenses || 0);
      const expenses = personalExpenses + jointExpenses + weddingExpenses;

      return {
        month: new Date(row.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        income,
        personalExpenses,
        jointExpenses,
        weddingExpenses,
        expenses,
        net: income - expenses,
      };
    });

    const expensesByCategoryResult = await query(
      `
        WITH expense_rows AS (
          SELECT c.name AS category, 'Personal'::text AS source, pe.amount::numeric AS amount
          FROM personal_expenses pe
          JOIN categories c ON c.id = pe.category_id
          WHERE pe.user_id = $1 AND pe.date BETWEEN $2 AND $3
          UNION ALL
          SELECT c.name AS category, 'Conjunto'::text AS source, je.amount::numeric AS amount
          FROM joint_expenses je
          JOIN categories c ON c.id = je.category_id
          WHERE je.created_by = $1 AND je.deleted_at IS NULL AND je.date BETWEEN $2 AND $3
          UNION ALL
          SELECT c.name AS category, 'Boda'::text AS source, we.amount::numeric AS amount
          FROM wedding_expenses we
          JOIN categories c ON c.id = we.category_id
          WHERE we.date BETWEEN $2 AND $3
        )
        SELECT category, source, COALESCE(SUM(amount), 0)::numeric AS amount
        FROM expense_rows
        GROUP BY category, source
        ORDER BY amount DESC, category ASC
      `,
      [userId, startDateSql, endDateSql]
    );

    const expensesByCategory = expensesByCategoryResult.rows.map((row) => ({
      category: row.category,
      source: row.source,
      amount: Number(row.amount || 0),
    }));

    const incomeByCategoryResult = await query(
      `
        SELECT c.name AS category, COALESCE(SUM(pi.amount), 0)::numeric AS amount
        FROM personal_incomes pi
        JOIN categories c ON c.id = pi.category_id
        WHERE pi.user_id = $1 AND pi.date BETWEEN $2 AND $3
        GROUP BY c.name
        ORDER BY amount DESC, c.name ASC
      `,
      [userId, startDateSql, endDateSql]
    );

    const incomeByCategory = incomeByCategoryResult.rows.map((row) => ({
      category: row.category,
      amount: Number(row.amount || 0),
    }));

    const insights = [
      {
        title: 'Dinero disponible',
        description: `Tus ingresos del periodo menos gastos personales y conjuntos dejan ${availableToSave.toFixed(2)} disponibles antes de considerar boda.`,
      },
      {
        title: 'Ahorro neto',
        description: `Despues de incluir gastos de boda, tu ahorro neto del periodo es ${netBalance.toFixed(2)}.`,
      },
      {
        title: 'Presion de gasto',
        description: totalIncome > 0
          ? `Tus gastos representan ${((totalExpenses / totalIncome) * 100).toFixed(1)}% de los ingresos del periodo.`
          : 'Aun no hay ingresos en el periodo seleccionado para calcular presion de gasto.',
      },
    ];

    return NextResponse.json({
      period,
      periodLabel: PERIOD_LABELS[period] || PERIOD_LABELS['3months'],
      generatedAt: new Date().toISOString(),
      range: {
        startDate: startDateSql,
        endDate: endDateSql,
      },
      summary: {
        totalIncome,
        totalPersonalExpenses,
        totalJointExpenses,
        totalWeddingExpenses,
        totalExpenses,
        availableToSave,
        netBalance,
        savingsRate,
      },
      monthlyTrend,
      expensesByCategory,
      incomeByCategory,
      insights,
    });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 400 });
  }
}
