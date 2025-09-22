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
    if (!formData.name.trim()) return 'El nombre es requerido';
    if (!formData.email.trim()) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'El correo electrónico no es válido';
    if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '16px' 
    }}>
      <Window title="Registro de Usuario - Sistema de Ventas" width="420px">
        <div style={{ padding: '16px' }}>
          {/* System Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>👤</div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0000aa', margin: '0 0 4px 0' }}>
              Crear Cuenta Nueva
            </h1>
            <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
              Complete el formulario para registrarse
            </p>
          </div>

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}>Información Personal</legend>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  👤 Nombre Completo:
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="Ingrese su nombre completo"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  📧 Correo Electrónico:
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="usuario@ejemplo.com"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  🔒 Contraseña:
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  🔒 Confirmar Contraseña:
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="Repita la contraseña"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '8px', fontSize: '11px', fontWeight: 'bold' }}
              >
                {loading ? '⏳ Registrando...' : '✅ Crear Cuenta'}
              </button>
            </fieldset>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onSwitchToLogin}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#0000ee', 
                textDecoration: 'underline', 
                cursor: 'pointer',
                fontSize: '11px'
              }}
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