import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import Window from '../Layout/Window';

const AuthPage: React.FC = () => {
  const { signIn, signUp, loading, signInWithGoogle } = useAuth();
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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError('Error al iniciar sesión con Google');
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
        <Window id="auth-loading" icon="⏳" title="Cargando..." width="300px">
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
        id="auth-main"
        icon="🔐"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ 
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

              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{ 
                  padding: '8px 16px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Continuar con Google
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