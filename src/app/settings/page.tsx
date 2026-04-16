'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    currency: 'HNL',
    language: 'es',
    notifications: {
      email: true,
      highExpenses: true,
      budgetAlerts: true,
      weeklyReport: true
    },
    appearance: {
      theme: 'light',
      density: 'normal'
    }
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast.success('Configuración guardada');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({...settings, currency: e.target.value});
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({...settings, language: e.target.value});
  };

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme: e.target.value
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Personaliza tu experiencia en FamilyFinance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b">
                <h2 className="text-lg font-semibold text-blue-900">General</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select
                    value={settings.currency}
                    onChange={handleCurrencyChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HNL">HNL - Lempira de Honduras</option>
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="ARS">ARS - Peso Argentino</option>
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="CLP">CLP - Peso Chileno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select
                    value={settings.language}
                    onChange={handleLanguageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b">
                <h2 className="text-lg font-semibold text-green-900">Notificaciones</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">Notificaciones por Email</h3>
                    <p className="text-sm text-gray-500">Recibe resúmenes y alertas por correo</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">Alertas de Gastos Altos</h3>
                    <p className="text-sm text-gray-500">Notificaciones cuando hay gastos inusuales</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('highExpenses')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.highExpenses ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.highExpenses ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">Alertas de Presupuesto</h3>
                    <p className="text-sm text-gray-500">Notificaciones cuando se acerca al límite</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('budgetAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.budgetAlerts ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Reporte Semanal</h3>
                    <p className="text-sm text-gray-500">Resumen semanal de tu actividad financiera</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('weeklyReport')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.weeklyReport ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 bg-purple-50 border-b">
                <h2 className="text-lg font-semibold text-purple-900">Apariencia</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={handleThemeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Densidad</label>
                  <select
                    value={settings.appearance.density}
                    onChange={e => setSettings({
                      ...settings,
                      appearance: {...settings.appearance, density: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="compact">Compacta</option>
                    <option value="normal">Normal</option>
                    <option value="comfortable">Cómoda</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="space-y-6">
            {/* Save Button */}
            <div className="bg-white rounded-xl shadow p-6">
              <button
                onClick={saveSettings}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                💾 Guardar Todos los Cambios
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Los cambios se guardarán en tu navegador
              </p>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Gestión de Datos</h3>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm mb-2">
                📥 Importar
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm mb-2">
                📤 Exportar
              </button>
              <button className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm">
                🗑️ Limpiar Caché
              </button>
            </div>

            {/* About */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Sobre FamilyFinance</h3>
              <p className="text-sm text-blue-800 mb-3">
                v1.0.0 - Gestión financiera familiar
              </p>
              <div className="space-y-2 text-xs">
                <p className="text-blue-700">
                  <strong>Desarrollado con:</strong> React, Next.js, TypeScript
                </p>
                <p className="text-blue-700">
                  <strong>Base de datos:</strong> PostgreSQL
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Soporte</h3>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                💬 Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
