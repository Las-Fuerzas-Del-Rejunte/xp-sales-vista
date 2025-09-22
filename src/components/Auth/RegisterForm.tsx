import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Window from '../Layout/Window';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'El correo electrónico no es válido';
    }
    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData.name, formData.email, formData.password);
      if (!success) {
        setError('El correo electrónico ya está registrado');
      }
    } catch (err) {
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Window title="Registro de Usuario - Sistema de Ventas" width="w-full max-w-md">
        <div className="space-y-4">
          {/* System Logo */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👤</div>
            <h1 className="text-xl font-bold text-blue-800">Crear Cuenta Nueva</h1>
            <p className="text-sm text-gray-600">Complete el formulario para registrarse</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="name">
                👤 Nombre Completo:
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="xp-input w-full"
                placeholder="Ingrese su nombre completo"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">
                📧 Correo Electrónico:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="xp-input w-full"
                placeholder="usuario@ejemplo.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="password">
                🔒 Contraseña:
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="xp-input w-full"
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="confirmPassword">
                🔒 Confirmar Contraseña:
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="xp-input w-full"
                placeholder="Repita la contraseña"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="xp-button w-full py-3 text-sm font-bold"
            >
              {loading ? '⏳ Registrando...' : '✅ Crear Cuenta'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              🔙 ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </div>
        </div>
      </Window>
    </div>
  );
};

export default RegisterForm;