'use client';

import { useEffect, useState } from 'react';
import { DashboardData } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export default function SavingsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const savingsData = await res.json();
        setData(savingsData);
      } catch (error) {
        console.error('Error fetching savings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">Cargando ahorros...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-red-600">No se pudieron cargar los ahorros.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Ahorros</h1>
          <p className="text-gray-600 mt-3">
            Aqui se muestra lo que realmente va quedando como ahorro segun tus ingresos registrados y todos tus gastos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1a4d3e] to-[#0f2d23] rounded-2xl p-8 text-white shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Ahorro acumulado</p>
            <p className="text-4xl md:text-5xl font-bold mt-4">
              {formatCurrency(data.accumulated_savings)}
            </p>
            <p className="text-white/80 mt-4 max-w-2xl">
              Este monto representa lo que has conservado como ahorro desde que empezaste a registrar movimientos.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Posible ahorro del mes</p>
            <p className={`text-3xl font-bold mt-3 ${
              data.monthly_savings_projection >= 0 ? 'text-[#2d5016]' : 'text-[#8B2E3C]'
            }`}>
              {formatCurrency(data.monthly_savings_projection)}
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Se calcula con los ingresos del mes menos los gastos del mes.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Ingresos totales</p>
            <p className="text-2xl font-bold text-[#1a3a52] mt-2">{formatCurrency(data.total_income)}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Gastos totales</p>
            <p className="text-2xl font-bold text-[#8B2E3C] mt-2">{formatCurrency(data.total_expense)}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Gastos personales</p>
            <p className="text-2xl font-bold text-[#8b4513] mt-2">{formatCurrency(data.total_personal_expenses)}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Gastos conjuntos</p>
            <p className="text-2xl font-bold text-[#6B2430] mt-2">{formatCurrency(data.total_joint_expenses)}</p>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Como se calcula</h2>
          <p className="text-gray-600 mt-2">
            El ahorro acumulado sale del total de ingresos menos el total de gastos registrados.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-[#eef6fb] border border-[#d5e8f6] p-5">
              <p className="text-sm text-[#35566f] font-medium">Paso 1</p>
              <p className="text-lg font-bold text-gray-900 mt-2">Ingresos totales</p>
              <p className="text-2xl font-bold text-[#1a3a52] mt-2">{formatCurrency(data.total_income)}</p>
            </div>

            <div className="rounded-xl bg-[#fff1f1] border border-[#f5d2d2] p-5">
              <p className="text-sm text-[#7a2c2c] font-medium">Paso 2</p>
              <p className="text-lg font-bold text-gray-900 mt-2">Restar gastos totales</p>
              <p className="text-2xl font-bold text-[#8B2E3C] mt-2">{formatCurrency(data.total_expense)}</p>
            </div>

            <div className="rounded-xl bg-[#f3f8f4] border border-[#d2e8d7] p-5">
              <p className="text-sm text-[#2d5016] font-medium">Resultado</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {formatCurrency(data.total_income)} - {formatCurrency(data.total_expense)}
              </p>
              <p className={`text-2xl font-bold mt-3 ${
                data.accumulated_savings >= 0 ? 'text-[#2d5016]' : 'text-[#8B2E3C]'
              }`}>
                = {formatCurrency(data.accumulated_savings)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
