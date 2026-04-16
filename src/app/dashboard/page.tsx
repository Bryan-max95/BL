'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SummaryWidgets from '../../components/dashboard/SummaryWidgets';
import RecentMovements from '../../components/dashboard/RecentMovements';
import { DashboardData } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-3">
                Bienvenido, <span className="font-semibold text-[#8B2E3C]">{user?.username}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-[#8B2E3C] text-white rounded-lg hover:bg-[#6B2430] font-medium transition-all shadow-sm hover:shadow-md">
                📥 Importar
              </button>
              <button className="px-6 py-2 bg-white border-2 border-[#8B2E3C] text-[#8B2E3C] rounded-lg hover:bg-[#8B2E3C] hover:text-white font-medium transition-all">
                📊 Descargar
              </button>
            </div>
          </div>
        </div>

        {/* Widgets */}
        {data && <SummaryWidgets data={data} />}

        {data && (
          <div className="mt-10">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Logica de Dinero Disponible</h2>
                  <p className="text-gray-600 mt-2">
                    Este valor muestra lo que te queda este mes despues de restar todos tus gastos a tus ingresos.
                  </p>
                </div>
                <div className={`px-5 py-3 rounded-xl text-white font-semibold ${
                  data.available_money >= 0 ? 'bg-[#1a3a52]' : 'bg-[#8B2E3C]'
                }`}>
                  Resultado: {formatCurrency(data.available_money)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="rounded-xl bg-[#eef6fb] border border-[#d5e8f6] p-5">
                  <p className="text-sm text-[#35566f] font-medium">Ingresos del mes</p>
                  <p className="text-2xl font-bold text-[#1a3a52] mt-2">
                    {formatCurrency(data.monthly_income)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#fff1f1] border border-[#f5d2d2] p-5">
                  <p className="text-sm text-[#7a2c2c] font-medium">Gastos del mes</p>
                  <p className="text-2xl font-bold text-[#8B2E3C] mt-2">
                    {formatCurrency(data.monthly_expense)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Personales: {formatCurrency(data.personal_expenses_month)} | Conjuntos: {formatCurrency(data.joint_expenses_month)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f3f8f4] border border-[#d2e8d7] p-5">
                  <p className="text-sm text-[#2d5016] font-medium">Formula aplicada</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {formatCurrency(data.monthly_income)} - {formatCurrency(data.monthly_expense)}
                  </p>
                  <p className={`text-xl font-bold mt-3 ${
                    data.available_money >= 0 ? 'text-[#2d5016]' : 'text-[#8B2E3C]'
                  }`}>
                    = {formatCurrency(data.available_money)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Movements */}
        <div className="mt-10">
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-[#8B2E3C]">
              Últimos Movimientos
            </h2>
            <RecentMovements movements={data?.recent_movements || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
