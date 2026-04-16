'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  username: string;
  last_login: string;
  created_at: string;
  is_active: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (res.ok) {
        toast.success('Contraseña actualizada correctamente');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditing(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al actualizar contraseña');
      }
    } catch (error) {
      toast.error('Error al actualizar contraseña');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Cargando perfil...</p>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Cargando perfil...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Administra tu cuenta y preferencias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b">
                <h2 className="text-lg font-semibold text-blue-900">Información de Cuenta</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                    {profile.username}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      profile.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.is_active ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Creada</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600 text-sm">
                      {new Date(profile.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Último Acceso</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600 text-sm">
                      {profile.last_login 
                        ? new Date(profile.last_login).toLocaleString('es-ES')
                        : 'Nunca'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 bg-purple-50 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-purple-900">Seguridad</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    {isEditing ? 'Cancelar' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="p-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                      >
                        Guardar Cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                        🔐
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        Para tu seguridad, puedes cambiar tu contraseña en cualquier momento.
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Recomendamos cambiar tu contraseña regularmente y usar contraseñas fuertes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                    👤
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cuenta Activa</p>
                  <p className="text-2xl font-bold text-blue-600">✓</p>
                </div>
              </div>
            </div>

            {/* Data Export */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Exportar Datos</h3>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm mb-2">
                📥 Descargar Datos
              </button>
              <p className="text-xs text-gray-500">
                Descarga un archivo con todos tus datos personales
              </p>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Acciones de Cuenta</h3>
              <button className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm">
                ⚠️ Desactivar Cuenta
              </button>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">¿Necesitas Ayuda?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Contacta con nuestro equipo de soporte si tienes preguntas.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                💬 Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
