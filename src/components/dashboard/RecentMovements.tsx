'use client';

import { formatCurrency } from '@/lib/formatters';

interface Movement {
  type?: string;
  amount: number;
  date: string;
  username?: string;
  category_name?: string;
  category?: string;
}

interface Props {
  movements: Movement[];
}

export default function RecentMovements({ movements = [] }: Props) {
  const getMovementType = (movement: Movement) => {
    if (movement.type?.includes('ingreso') || movement.type?.includes('Ingreso')) {
      return 'Ingreso';
    }
    return 'Gasto';
  };

  const isIncome = (movement: Movement) => {
    return movement.type?.includes('ingreso') || movement.type?.includes('Ingreso');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">📭 No hay movimientos registrados</p>
        <p className="text-gray-400 text-sm mt-2">Los movimientos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement, index) => {
              const income = isIncome(movement);
              const movementType = getMovementType(movement);
              const category = movement.category_name || movement.category || 'Sin categoría';
              const username = movement.username || 'Usuario';

              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{formatDate(movement.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{username}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      income
                        ? 'bg-[#d4f4e6] text-[#2d5016]'
                        : 'bg-[#f4d4d4] text-[#8B2E3C]'
                    }`}>
                      {income ? '↑' : '↓'} {movementType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{category}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold">
                    <span className={income ? 'text-[#2d5016]' : 'text-[#8B2E3C]'}>
                      {income ? '+' : '-'}{formatCurrency(movement.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-3">
        {movements.map((movement, index) => {
          const income = isIncome(movement);
          const movementType = getMovementType(movement);
          const category = movement.category_name || movement.category || 'Sin categoría';
          const username = movement.username || 'Usuario';

          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{category}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(movement.date)}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                  income
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {movementType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">{username}</p>
                <p className={`font-bold text-sm ${income ? 'text-green-600' : 'text-red-600'}`}>
                  {income ? '+' : '-'}{formatCurrency(movement.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
