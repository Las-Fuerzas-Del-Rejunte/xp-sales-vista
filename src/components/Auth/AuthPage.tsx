import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import Window from '../Layout/Window';

const AuthPage: React.FC = () => {
  const { signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('El nombre es requerido');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.name);
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          setError('Credenciales inválidas');
        } else if (result.error.message.includes('User already registered')) {
          setError('El usuario ya está registrado');
        } else if (result.error.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión');
        } else {
          setError(result.error.message);
        }
      } else if (!isLogin) {
        setError('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#c0c0c0'
      }}>
        <Window title="Cargando..." width="300px">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Verificando autenticación...</p>
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#c0c0c0',
      padding: '20px'
    }}>
      <Window 
        title={isLogin ? "Iniciar Sesión - GestiónVentas" : "Registro - GestiónVentas"} 
        width="400px"
      >
        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>💼</div>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#0000aa',
              margin: '0 0 8px 0'
            }}>
              Sistema de Gestión de Ventas
            </h2>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {isLogin ? 'Ingrese sus credenciales' : 'Cree su cuenta'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              background: error.includes('exitoso') ? '#d4edda' : '#f8d7da',
              border: `1px solid ${error.includes('exitoso') ? '#c3e6cb' : '#f5c6cb'}`,
              color: error.includes('exitoso') ? '#155724' : '#721c24',
              padding: '8px 12px',
              fontSize: '11px',
              marginBottom: '16px',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <fieldset style={{ 
              border: '2px groove #c0c0c0', 
              padding: '16px',
              marginBottom: '16px'
            }}>
              <legend style={{ fontSize: '11px', fontWeight: 'bold' }}>
                {isLogin ? 'Credenciales de Acceso' : 'Información de Registro'}
              </legend>

              {!isLogin && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: '1px inset #c0c0c0'
                    }}
                    placeholder="Ingrese su nombre completo"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: '1px inset #c0c0c0'
                  }}
                  placeholder="usuario@ejemplo.com"
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ marginBottom: !isLogin ? '12px' : '0' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  Contraseña:
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: '1px inset #c0c0c0'
                  }}
                  placeholder={isLogin ? "Contraseña" : "Mínimo 6 caracteres"}
                  disabled={isSubmitting}
                />
              </div>

              {!isLogin && (
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    Confirmar Contraseña:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: '1px inset #c0c0c0'
                    }}
                    placeholder="Repita la contraseña"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </fieldset>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ 
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: isSubmitting ? '#f0f0f0' : undefined,
                  cursor: isSubmitting ? 'wait' : 'pointer'
                }}
              >
                {isSubmitting 
                  ? '⏳ Procesando...' 
                  : isLogin 
                    ? '🔑 Iniciar Sesión' 
                    : '📝 Registrarse'
                }
              </button>
            </div>

            {/* Switch Mode */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    confirmPassword: ''
                  });
                }}
                style={{ 
                  fontSize: '11px',
                  background: 'none',
                  border: 'none',
                  color: '#0000aa',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
                disabled={isSubmitting}
              >
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'
                }
              </button>
            </div>
          </form>

          {/* Test Credentials for Login */}
          {isLogin && (
            <fieldset style={{ 
              border: '1px groove #c0c0c0', 
              padding: '8px',
              marginTop: '16px'
            }}>
              <legend style={{ fontSize: '10px', color: '#666' }}>
                Nota
              </legend>
              <p style={{ 
                fontSize: '10px', 
                color: '#666', 
                margin: 0,
                lineHeight: '1.4'
              }}>
                Si es tu primera vez, regístrate para crear una cuenta.
                Los datos se guardarán de forma segura en la base de datos.
              </p>
            </fieldset>
          )}
        </div>
      </Window>
    </div>
  );
};

export default AuthPage;