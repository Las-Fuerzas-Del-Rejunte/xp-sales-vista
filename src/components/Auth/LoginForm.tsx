import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Window from '../Layout/Window';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Window title="Iniciar Sesión - Sistema de Ventas" width="w-full max-w-md">
        <div className="space-y-4">
          {/* System Logo */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🛒</div>
            <h1 className="text-xl font-bold text-blue-800">Sistema de Gestión de Ventas</h1>
            <p className="text-sm text-gray-600">Versión 1.0 - Estilo Windows XP</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">
                📧 Correo Electrónico:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="xp-input w-full"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="xp-button w-full py-3 text-sm font-bold"
            >
              {loading ? '⏳ Ingresando...' : '🚀 Iniciar Sesión'}
            </button>
          </form>

          <div className="text-center space-y-2">
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              👤 ¿No tienes cuenta? Regístrate aquí
            </button>
            
            <div className="border-t pt-2">
              <p className="text-xs text-gray-500">Credenciales de prueba:</p>
              <p className="text-xs text-gray-600">
                <strong>Admin:</strong> admin@sistema.com / admin123
              </p>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
};

export default LoginForm;