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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '16px' 
    }}>
      <Window title="Iniciar Sesión - Sistema de Ventas" width="400px">
        <div style={{ padding: '16px' }}>
          {/* System Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛒</div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0000aa', margin: '0 0 4px 0' }}>
              Sistema de Gestión de Ventas
            </h1>
            <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
              Versión 1.0 - Estilo Windows XP
            </p>
          </div>

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}>Credenciales de Acceso</legend>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  📧 Correo Electrónico:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="usuario@ejemplo.com"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  🔒 Contraseña:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '8px', fontSize: '11px', fontWeight: 'bold' }}
              >
                {loading ? '⏳ Ingresando...' : '🚀 Iniciar Sesión'}
              </button>
            </fieldset>
          </form>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button
              onClick={onSwitchToRegister}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#0000ee', 
                textDecoration: 'underline', 
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              👤 ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
          
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '8px' }}>
            <legend style={{ fontSize: '10px', color: '#666' }}>Credenciales de prueba</legend>
            <div style={{ fontSize: '10px', color: '#666' }}>
              <strong>Admin:</strong> admin@sistema.com / admin123
            </div>
          </fieldset>
        </div>
      </Window>
    </div>
  );
};

export default LoginForm;