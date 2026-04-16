import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }

  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const userId = payload.id;

    // Totales historicos del usuario actual
    const totalIncomes = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM personal_incomes WHERE user_id = $1',
      [userId]
    );
    
    // Total de gastos historicos del usuario actual
    const personalExpenses = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM personal_expenses WHERE user_id = $1',
      [userId]
    );
    
    const jointExpenses = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM joint_expenses WHERE created_by = $1 AND deleted_at IS NULL',
      [userId]
    );

    const totalIncome = Number(totalIncomes.rows[0].total || 0);
    const totalPersonalExpenses = Number(personalExpenses.rows[0].total || 0);
    const totalJointExpenses = Number(jointExpenses.rows[0].total || 0);
    const totalExpensesSum = totalPersonalExpenses + totalJointExpenses;
    const totalBalance = totalIncome - totalExpensesSum;

    // Ingresos del mes del usuario actual
    const monthlyIncome = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_incomes
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`,
      [userId, currentYear, currentMonth]
    );

    // Gastos del mes del usuario actual
    const monthlyExpensePersonal = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_expenses
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`,
      [userId, currentYear, currentMonth]
    );
    
    const monthlyExpenseJoint = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM joint_expenses
       WHERE created_by = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3 AND deleted_at IS NULL`,
      [userId, currentYear, currentMonth]
    );

    const monthlyIncomeTotal = Number(monthlyIncome.rows[0].total || 0);
    const monthlyPersonalExpenseTotal = Number(monthlyExpensePersonal.rows[0].total || 0);
    const monthlyJointExpenseTotal = Number(monthlyExpenseJoint.rows[0].total || 0);
    const monthlyExpense = monthlyPersonalExpenseTotal + monthlyJointExpenseTotal;
    const availableMoney = monthlyIncomeTotal - monthlyExpense;
    const accumulatedSavings = totalIncome - totalExpensesSum;

    // Wedding progress
    const weddingBudget = await query('SELECT total_budget FROM wedding_budget LIMIT 1');
    const weddingSpent = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM wedding_expenses'
    );
    
    let weddingProgress = 0;
    if (weddingBudget.rows[0]?.total_budget > 0) {
      weddingProgress = (weddingSpent.rows[0].total / weddingBudget.rows[0].total_budget) * 100;
    }

    // Recent movements
    const recentMovements = await query(`
      (SELECT 
        'Ingreso Personal' as type,
        p.amount,
        p.date,
        u.username,
        c.name as category
      FROM personal_incomes p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = $1
      LIMIT 5)
      UNION ALL
      (SELECT 
        'Gasto Personal' as type,
        p.amount,
        p.date,
        u.username,
        c.name as category
      FROM personal_expenses p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = $1
      LIMIT 5)
      UNION ALL
      (SELECT 
        'Gasto Conjunto' as type,
        j.amount,
        j.date,
        u.username,
        c.name as category
      FROM joint_expenses j
      JOIN users u ON j.created_by = u.id
      JOIN categories c ON j.category_id = c.id
      WHERE j.deleted_at IS NULL
      LIMIT 5)
      ORDER BY date DESC
      LIMIT 10
    `, [userId]);

    return NextResponse.json({
      total_balance: totalBalance,
      total_income: totalIncome,
      total_expense: totalExpensesSum,
      total_personal_expenses: totalPersonalExpenses,
      total_joint_expenses: totalJointExpenses,
      monthly_income: monthlyIncomeTotal,
      monthly_expense: monthlyExpense,
      available_money: availableMoney,
      accumulated_savings: accumulatedSavings,
      personal_expenses_month: monthlyPersonalExpenseTotal,
      joint_expenses_month: monthlyJointExpenseTotal,
      monthly_savings_projection: availableMoney,
      wedding_progress: weddingProgress,
      recent_movements: recentMovements.rows,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'Error al cargar dashboard' }, { status: 500 });
  }
}
