'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface WeddingBudgetData {
  total_budget: number;
  budget_currency: string;
  event_date: string;
  notes: string;
  spent: number;
  remaining: number;
  percentage: number;
}

interface WeddingExpense {
  id: number;
  amount: number;
  category_name: string;
  username: string;
  date: string;
  description?: string;
}

export default function WeddingPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<WeddingBudgetData | null>(null);
  const [expenses, setExpenses] = useState<WeddingExpense[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    total_budget: '',
    budget_currency: 'HNL',
    event_date: '',
    notes: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    const res = await fetch('/api/wedding/budget');
    const data = await res.json();
    setBudget(data);
    if (data.expenses) {
      setExpenses(data.expenses);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const all = await res.json();
    setCategories(all.filter((c: any) => c.type === 'wedding'));
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/wedding/budget', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetForm)
    });

    if (res.ok) {
      toast.success('Presupuesto actualizado');
      setShowBudgetModal(false);
      fetchData();
    } else {
      toast.error('Error al actualizar');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/wedding/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseForm)
    });

    if (res.ok) {
      toast.success('Gasto registrado');
      setShowExpenseModal(false);
      fetchData();
      setExpenseForm({
        amount: '',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      toast.error('Error al registrar');
    }
  };

  if (!budget) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gasto de la boda</h1>
            <p className="text-gray-600 mt-3">Planifica y gestiona tu presupuesto de boda</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBudgetModal(true)}
              className="bg-[#8B2E3C] text-white px-6 py-2 rounded-lg hover:bg-[#6B2430] font-medium transition-all shadow-sm hover:shadow-md"
            >
              ⚙️ Editar Presupuesto
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-[#5c2e5c] text-white px-6 py-2 rounded-lg hover:bg-[#3d1a3d] font-medium transition-all shadow-sm hover:shadow-md"
            >
              + Gasto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-l-4 border-[#5c2e5c]">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Presupuesto Total</p>
              <p className="text-3xl font-bold text-[#5c2e5c]">{formatCurrency(budget.total_budget)}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-l-4 border-[#8B2E3C]">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Gastado</p>
              <p className="text-3xl font-bold text-[#8B2E3C]">{formatCurrency(budget.spent)}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-l-4 border-[#2d5016]">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Disponible</p>
              <p className={`text-3xl font-bold ${budget.remaining >= 0 ? 'text-[#2d5016]' : 'text-[#5c1a1a]'}`}>
                {formatCurrency(budget.remaining)}
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-l-4 border-gray-400">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Fecha de Evento</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(budget.event_date).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Progreso del Presupuesto</h3>
              <span className="text-2xl font-bold text-[#8B2E3C]">{formatPercentage(budget.percentage)}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  budget.percentage <= 75 ? 'bg-gradient-to-r from-[#2d5016] to-[#1f3610]' 
                    : budget.percentage <= 90 ? 'bg-gradient-to-r from-[#6B5c2d] to-[#4d3d1f]' 
                    : 'bg-gradient-to-r from-[#8B2E3C] to-[#5c1a1a]'
                }`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {budget.percentage <= 75 && '✓ Presupuesto bajo control'}
              {budget.percentage > 75 && budget.percentage <= 90 && '⚠ Acercándose al límite'}
              {budget.percentage > 90 && '⚠ Presupuesto casi agotado'}
            </p>
          </div>

          {budget.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600"><strong>Notas:</strong> {budget.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-pink-50 border-b">
            <h2 className="text-lg font-semibold text-pink-800">Gastos del Evento</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs">Registrado por</th>
                  <th className="px-4 py-3 text-left text-xs">Descripción</th>
                  <th className="px-4 py-3 text-right text-xs">Monto</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">{expense.category_name}</td>
                    <td className="px-4 py-2 text-sm">{expense.username}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{expense.description || '-'}</td>
                    <td className="px-4 py-2 text-sm text-right text-pink-600">
                      ${Number(expense.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showBudgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Editar Presupuesto</h2>
              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Presupuesto Total</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={budgetForm.total_budget}
                    onChange={e => setBudgetForm({...budgetForm, total_budget: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Moneda</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={budgetForm.budget_currency}
                    onChange={e => setBudgetForm({...budgetForm, budget_currency: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha del Evento</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={budgetForm.event_date}
                    onChange={e => setBudgetForm({...budgetForm, event_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notas</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    value={budgetForm.notes}
                    onChange={e => setBudgetForm({...budgetForm, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Registrar Gasto de Boda</h2>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={expenseForm.category_id}
                    onChange={e => setExpenseForm({...expenseForm, category_id: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={expenseForm.description}
                    onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
