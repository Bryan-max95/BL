export interface User {
  id: number;
  username: string;
  last_login: Date | null;
  is_active: boolean;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'wedding';
  is_active: boolean;
}

export interface PersonalIncome {
  id: number;
  user_id: number;
  amount: number;
  category_id: number;
  category_name?: string;
  description: string;
  date: Date;
  created_at: Date;
}

export interface PersonalExpense {
  id: number;
  user_id: number;
  registered_by: number;
  amount: number;
  category_id: number;
  category_name?: string;
  description: string;
  date: Date;
  created_at: Date;
}

export interface JointExpense {
  id: number;
  amount: number;
  category_id: number;
  category_name?: string;
  description: string;
  date: Date;
  created_by: number;
  last_edited_by: number;
  created_at: Date;
  deleted_at: Date | null;
}

export interface WeddingBudget {
  id: number;
  total_budget: number;
  budget_currency: string;
  event_date: Date;
  notes: string;
}

export interface WeddingExpense {
  id: number;
  budget_id: number;
  category_id: number;
  category_name?: string;
  description: string;
  amount: number;
  date: Date;
  registered_by: number;
  created_at: Date;
}

export interface DashboardData {
  total_balance: number;
  total_income: number;
  total_expense: number;
  total_personal_expenses: number;
  total_joint_expenses: number;
  monthly_income: number;
  monthly_expense: number;
  available_money: number;
  accumulated_savings: number;
  personal_expenses_month: number;
  joint_expenses_month: number;
  monthly_savings_projection: number;
  wedding_progress: number;
  recent_movements: Array<any>;
}
