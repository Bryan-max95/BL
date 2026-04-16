'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';

interface AuditLog {
  id: number;
  user_id: number;
  action: 'create' | 'update' | 'delete';
  entity: string;
  entity_id: number;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  username: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entity: 'all',
    action: 'all',
    searchUser: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    if (filters.entity !== 'all') {
      filtered = filtered.filter(log => log.entity === filters.entity);
    }

    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.searchUser) {
      filtered = filtered.filter(log =>
        log.username.toLowerCase().includes(filters.searchUser.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entity: string) => {
    const icons: Record<string, string> = {
      personal_incomes: '💰',
      personal_expenses: '💸',
      joint_expenses: '👥',
      wedding_expenses: '💍',
      users: '👤',
      categories: '🏷️',
      wedding_budget: '💒'
    };
    return icons[entity] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Cargando historial...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Cambios</h1>
          <p className="text-gray-600 mt-2">Auditoría completa de todas las modificaciones</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entidad</label>
              <select
                value={filters.entity}
                onChange={e => setFilters({...filters, entity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="personal_incomes">Ingresos Personales</option>
                <option value="personal_expenses">Gastos Personales</option>
                <option value="joint_expenses">Gastos Conjuntos</option>
                <option value="wedding_expenses">Gastos de Boda</option>
                <option value="users">Usuarios</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Acción</label>
              <select
                value={filters.action}
                onChange={e => setFilters({...filters, action: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="delete">Eliminación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={filters.searchUser}
                onChange={e => setFilters({...filters, searchUser: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Últimas {filteredLogs.length} modificaciones
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Fecha/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Entidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Detalles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                          {log.username}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="flex items-center gap-2">
                          {getEntityIcon(log.entity)}
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                          {log.action === 'create' ? '✓ Creado' : log.action === 'update' ? '✎ Editado' : '✕ Eliminado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <details className="cursor-pointer">
                          <summary className="font-medium text-blue-600 hover:text-blue-800">
                            Ver detalles
                          </summary>
                          <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-2">
                            {log.old_values && (
                              <div>
                                <p className="font-medium text-gray-700">Valores anteriores:</p>
                                <pre className="text-gray-600 overflow-auto max-h-24">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <p className="font-medium text-gray-700">Nuevos valores:</p>
                                <pre className="text-gray-600 overflow-auto max-h-24">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay registros que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
