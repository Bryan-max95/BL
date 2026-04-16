'use client';

import { DashboardData } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface Props {
  data: DashboardData;
}

export default function SummaryWidgets({ data }: Props) {
  const widgets = [
    {
      title: 'Balance Total',
      value: formatCurrency(data.total_balance || 0),
      color: 'from-[#8B2E3C] to-[#6B2430]',
      icon: '💰',
      trend: '+2.5%',
      bg: 'bg-gradient-to-br',
    },
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(data.monthly_income || 0),
      color: 'from-[#2d5016] to-[#1f3610]',
      icon: '📈',
      trend: '+1.2%',
      bg: 'bg-gradient-to-br',
    },
    {
      title: 'Gastos del Mes',
      value: formatCurrency(data.monthly_expense || 0),
      color: 'from-[#5c1a1a] to-[#3d0f0f]',
      icon: '📉',
      trend: '-0.8%',
      bg: 'bg-gradient-to-br',
    },
    {
      title: 'Dinero Disponible',
      value: formatCurrency(data.available_money || 0),
      color: 'from-[#1a3a52] to-[#0f2235]',
      icon: '💵',
      trend: '+3.1%',
      bg: 'bg-gradient-to-br',
    },
    {
      title: 'Gastos Personales',
      value: formatCurrency(data.personal_expenses_month || 0),
      color: 'from-[#8b4513] to-[#5f2f0c]',
      icon: '🧾',
      trend: '-1.4%',
      bg: 'bg-gradient-to-br',
    },
    {
      title: 'Presupuesto Boda',
      value: `${(data.wedding_progress || 0).toFixed(1)}%`,
      color: 'from-[#5c2e5c] to-[#3d1a3d]',
      icon: '💒',
      trend: '+2.2%',
      bg: 'bg-gradient-to-br',
      subtext: 'utilizado',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget, index) => (
        <div 
          key={index} 
          className={`${widget.bg} ${widget.color} rounded-xl p-7 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer`}
        >
          {/* Fondo decorativo sutil */}
          <div className="absolute -right-12 -top-12 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="text-7xl">{widget.icon}</div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium opacity-90 max-w-xs leading-tight">{widget.title}</h3>
              <span className="text-3xl ml-2">{widget.icon}</span>
            </div>
            
            {/* Value */}
            <p className="text-3xl font-bold mb-1 tracking-tight">{widget.value}</p>
            
            {/* Subtext */}
            {widget.subtext && (
              <p className="text-xs opacity-75 mb-4">{widget.subtext}</p>
            )}
            
            {/* Trend */}
            <div className="pt-4 border-t border-white/20 flex items-center justify-between">
              <p className="text-xs opacity-80 font-medium">
                {widget.trend.startsWith('+') ? '↑' : '↓'} {widget.trend}
              </p>
              <span className="text-xs opacity-60">vs mes anterior</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
