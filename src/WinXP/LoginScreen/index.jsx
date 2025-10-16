import React, { useState } from 'react';
import bootScreenImage from '../../pages/bootScreen.png';
import { useAppState } from 'state/AppStateContext';
// import laLibertadAvanza from './laLibertadAvanza.jpg';
import leonVLLC from './leonVLLC.png';

function Field({ label, type, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <div style={{ width: 100, color: '#003399' }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 220 }}
      />
    </div>
  );
}

function ResetPasswordModal({ onClose, onSubmit, initialEmail }) {
  const [resetEmail, setResetEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit(resetEmail);
    setIsLoading(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: 'linear-gradient(180deg,#f5f3e6,#ece9d8)',
          border: '2px solid #003399',
          boxShadow: '0 10px 28px rgba(0,0,0,0.45), 0 0 0 2px #7ba7ff inset',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(180deg,#0a246a,#124a98)',
            color: 'white',
            padding: '10px 12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        >
          <span>Restablecer contraseña</span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#fff',
              border: 0,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 16 }} onKeyDown={onKeyDown}>
          <div style={{ marginBottom: 16, color: '#003399' }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ width: 80, color: '#003399' }}>Email:</div>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              style={{
                flex: 1,
                padding: '4px 6px',
                border: '1px solid #7f9db9',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)',
              }}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !resetEmail}
              style={{
                background: isLoading || !resetEmail ? '#d4d0c8' : 'linear-gradient(#e6f0ff,#cfe0ff)',
                border: '1px solid #7aa2e8',
                padding: '6px 20px',
                cursor: isLoading || !resetEmail ? 'not-allowed' : 'pointer',
                minWidth: 80,
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(#fff,#eee)',
                border: '1px solid #7aa2e8',
                padding: '6px 20px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                minWidth: 80,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ onClose }) {
  const { supabase, dispatch, ACTIONS } = useAppState();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const translateError = errorMessage => {
    const dictionary = {
      'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
      'Email not confirmed': 'Debes confirmar tu correo para continuar',
      'User not found': 'Usuario no encontrado',
      'Invalid email': 'Dirección de email inválida',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Password should be at least 6 characters long': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'User already registered': 'Este email ya está registrado',
      'Signup requires a valid password': 'Debes ingresar una contraseña válida',
      'Failed to fetch': 'Error de conexión. Revisa tu internet e intenta nuevamente',
      'Network request failed': 'Error de red. Intenta nuevamente',
      'Request timeout': 'Se agotó el tiempo de espera. Intenta nuevamente',
      'OAuth provider error': 'Error con el proveedor de autenticación',
      'Too many requests': 'Demasiados intentos. Espera un momento',
      'Service unavailable': 'Servicio no disponible. Intenta más tarde',
    };

    if (!errorMessage) return '';
    const key = dictionary[errorMessage];
    if (key) return key;

    if (errorMessage.includes('Invalid login credentials')) {
      return 'Credenciales de inicio de sesión inválidas';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Email no confirmado. Revisa tu correo electrónico';
    }
    if (errorMessage.includes('User already registered')) {
      return 'Este email ya está registrado';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'Dirección de email inválida';
    }
    if (errorMessage.includes('OAuth')) {
      return 'No pudimos iniciar con Google. Inténtalo de nuevo.';
    }
    if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
      return 'Error de conexión. Verifica tu internet e inténtalo nuevamente';
    }
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  };

  async function onLogin() {
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const translated = translateError(error.message);
      setMessage(translated);
      if (error.message && error.message.includes('Invalid login credentials')) {
        setMode('register');
      }
      return;
    }
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
  }
  async function onRegister() {
    setMessage('');
    if (!email || !password) {
      return setMessage('Ingresa email y contraseña');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    if (data.session && data.user) {
      dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
      setMessage('Registro completado. ¡Bienvenido!');
    } else {
      setMode('login');
      setMessage('Hemos enviado un correo de confirmación. Revisa tu bandeja para activar la cuenta.');
    }
  }
  async function onLoginWithGoogle() {
    try {
      setMessage('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        setMessage(translateError(error.message));
        return;
      }
      // Supabase redirige automáticamente; si devuelve URL, forzamos la navegación.
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setMessage('Abre la ventana emergente de Google para continuar.');
      }
    } catch (e) {
      setMessage(translateError(e?.message || '')); 
    }
  }
  async function onResetPassword(resetEmail) {
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      setMessage(translateError(error.message));
      setShowResetModal(false);
      return;
    }
    setShowResetModal(false);
    setMessage('Te hemos enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
  }
  function onKeyDown(e) {
    if (e.key === 'Enter') {
      if (mode === 'login') onLogin(); else onRegister();
    }
  }

  return (
    <div
      style={{
        width: 520,
        background: 'linear-gradient(180deg,#f5f3e6,#ece9d8)',
        border: '2px solid #003399',
        boxShadow: '0 10px 28px rgba(0,0,0,0.45), 0 0 0 2px #7ba7ff inset',
        position: 'relative',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg,#0a246a,#124a98)',
          color: 'white',
          padding: '10px 12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      >
        <span>{mode === 'login' ? 'Iniciar sesión en Windows XP' : 'Registrarse en Windows XP'}</span>
        <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: 0, fontSize: 16, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: 0 }} onKeyDown={onKeyDown}>
        {/* Banner interno XP */}
        <div style={{
          height: 72,
          background: mode === 'login' ? 'linear-gradient(180deg,#3b70c9 0%, #2d5fb5 50%, #2453a6 100%)' : 'linear-gradient(180deg,#2f9c5a 0%, #28864e 60%, #207443 100%)',
          color: '#fff',
          padding: '10px 14px',
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>Sistema de Ventas <span style={{ color: '#ff7a00' }}>El Rejunte</span></div>
          <div style={{ opacity: 0.9, marginTop: 4, fontSize: 12 }}>{mode === 'login' ? 'Professional' : 'Create Account'}</div>
        </div>

        {/* Panel beige con campos */}
        <div style={{ background: '#ece9d8', padding: 16 }}>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <Field label="Usuario" type="email" value={email} onChange={setEmail} />
            <Field label="Contraseña" type="password" value={password} onChange={setPassword} />

            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button
                onClick={mode === 'login' ? onLogin : onRegister}
                style={{
                  background: 'linear-gradient(#e6f0ff,#cfe0ff)',
                  border: '1px solid #7aa2e8',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >{mode === 'login' ? 'Acceder' : 'Crear cuenta'}</button>
              <button
                onClick={onLoginWithGoogle}
                style={{ background: 'linear-gradient(#fff,#eee)', border: '1px solid #7aa2e8', padding: '6px 12px', cursor: 'pointer' }}
              >Iniciar con Google</button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'transparent', border: 0, color: '#003399', cursor: 'pointer', textAlign: 'left' }}>
                {mode === 'login' ? 'Crear nueva cuenta...' : 'Ya tengo cuenta. Iniciar sesión'}
              </button>
              {mode === 'login' && (
                <button 
                  onClick={() => setShowResetModal(true)} 
                  style={{ background: 'transparent', border: 0, color: '#003399', cursor: 'pointer', textAlign: 'left' }}
                >
                  Olvidé mi contraseña
                </button>
              )}
            </div>
            {message && <div style={{ color: '#c00', marginTop: 8 }}>{message}</div>}
          </div>
        </div>
      </div>
      {showResetModal && (
        <ResetPasswordModal
          onClose={() => setShowResetModal(false)}
          onSubmit={onResetPassword}
          initialEmail={email}
        />
      )}
    </div>
  );
}

function LoginScreen() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b2f7d' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50%',
          height: '55%',
          background:
            'radial-gradient(circle at 25% 35%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 64,
          width: '52%',
          background:
            'linear-gradient(180deg, #5f86d1 0%, #5a80cc 35%, #5175c3 70%, #476ab8 100%)',
          boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />
      <div
        style={{ position: 'absolute', left: '50%', top: 0, bottom: 64, width: 1, background: 'rgba(255,255,255,0.25)' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 35%, #2b63c0 0%, #204eaa 35%, #173f98 60%, #0f3288 80%, #0a2a79 100%)',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          background: 'linear-gradient(180deg, #1c3f8a 0%, #153579 60%, #0e2c69 100%)',
          borderTop: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.25) inset',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,                 // ocupa toda la pantalla
          display: 'flex',
          alignItems: 'center',     // centra verticalmente
          justifyContent: 'center', // centra horizontalmente
          gap: 120,                 // espacio entre logo y usuario
        }}
      >
        {/* Columna con logo + texto */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: -31,  // mueve hacia arriba
            marginLeft: -131,  // mueve hacia la derecha
          }}
        >
          <img
            src={bootScreenImage}
            alt="Windows XP"
            style={{
              height: 140,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
            }}
          />
          <div
            style={{
              marginTop: 24,
              fontSize: 18,
              color: 'white',
              maxWidth: 260,
              textAlign: 'center',
            }}
          >
            Para comenzar, ingrese con su Usuario
          </div>
        </div>

        {/* Bloque del usuario */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'white',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              background: '#1a9bd7',
              border: '3px solid #7fb3e7',
              boxShadow: '0 0 0 4px #0a2b6a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img alt="avatar" src={leonVLLC} style={{ width: 40, height: 40 }} />
          </div>
          <div style={{ fontSize: 22, textShadow: '1px 1px 2px #000' }}>Usuario</div>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 24, bottom: 10, color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
        Presione en USUARIO<br />
        Segun la cuenta que utilice conocera una parte del sistema.
      </div>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoginModal onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default LoginScreen;


