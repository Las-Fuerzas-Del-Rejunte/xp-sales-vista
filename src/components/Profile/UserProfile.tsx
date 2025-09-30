import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useApp } from '../../contexts/SupabaseAppContext';
import Window from '../Layout/Window';

const UserProfile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { setCurrentView } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado exitosamente');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: user?.email || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Window id="profile" icon="👤" title="Mi Perfil - Información Personal">
        {/* Toolbar */}
        <div className="xp-toolbar mb-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="xp-button text-sm"
          >
            🏠 Inicio
          </button>
          <div className="text-sm text-gray-600 ml-auto">
            Usuario: {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">✅ {successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              👤 Información Personal
            </h3>

            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2" htmlFor="name">
                    Nombre Completo: *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`xp-input w-full ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Ingrese su nombre completo"
                    disabled={loading}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" htmlFor="email">
                    Correo Electrónico: *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`xp-input w-full ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="usuario@ejemplo.com"
                    disabled={loading}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="xp-button flex-1 py-2 font-bold"
                  >
                    {loading ? '⏳ Guardando...' : '✅ Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="xp-button flex-1 py-2"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </form>
            ) : (
              /* Display Mode */
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="text-sm font-bold text-gray-700 mb-1">Nombre:</p>
                  <p className="text-gray-800">{profile?.name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="text-sm font-bold text-gray-700 mb-1">Correo Electrónico:</p>
                  <p className="text-gray-800">{user?.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-300">
                  <p className="text-sm font-bold text-gray-700 mb-1">Rol:</p>
                  <p className="text-gray-800">
                    {profile?.role === 'admin' ? '👨‍💼 Administrador' : '👤 Cliente'}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="xp-button w-full py-3 font-bold"
                >
                  ✏️ Editar Perfil
                </button>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              ℹ️ Información de la Cuenta
            </h3>

            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">🔑 Seguridad</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Estado:</strong> ✅ Cuenta Activa</p>
                  <p><strong>Último acceso:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>

              {profile?.role === 'admin' && (
                <div className="bg-purple-50 p-4 rounded border-2 border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">👨‍💼 Privilegios de Administrador</h4>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• Gestión de productos</p>
                    <p>• Gestión de marcas</p>
                    <p>• Acceso completo al sistema</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded border border-gray-300">
                <h4 className="font-bold text-gray-700 mb-2">📊 Estadísticas</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Cuenta creada:</strong> Usuario registrado</p>
                  <p><strong>ID de usuario:</strong> {user?.id}</p>
                  <p><strong>Versión del sistema:</strong> 1.0.0</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2">🛡️ Privacidad</h4>
                <p className="text-sm text-yellow-700">
                  Sus datos están almacenados localmente en su navegador. 
                  No se comparten con terceros.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-bold text-gray-800 mb-3">🖥️ Información del Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded border border-gray-300">
              <p><strong>Sistema:</strong> Gestión de Ventas</p>
              <p><strong>Versión:</strong> 1.0.0 MVP</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-300">
              <p><strong>Estilo:</strong> Windows XP</p>
              <p><strong>Tecnología:</strong> React + TypeScript</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-300">
              <p><strong>Estado:</strong> ✅ Operativo</p>
              <p><strong>Modo:</strong> Desarrollo</p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="xp-status-bar mt-4">
          Estado: Perfil cargado | Usuario: {profile?.name} | Última actualización: {new Date().toLocaleString()}
        </div>
      </Window>
    </div>
  );
};

export default UserProfile;