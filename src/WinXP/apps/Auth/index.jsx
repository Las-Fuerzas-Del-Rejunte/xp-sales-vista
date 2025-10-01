import React, { useState } from 'react';
import { useAppState } from 'state/AppStateContext';

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function AuthApp() {
  const { supabase, state, dispatch, ACTIONS } = useAppState();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Registro simplificado: solo email y contraseña
  const [message, setMessage] = useState('');

  const translateError = errorMessage => {
    if (!errorMessage) return '';
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
      'Failed to fetch': 'Error de conexión. Verifica tu internet e intenta nuevamente',
      'Network request failed': 'Error de red. Intenta nuevamente',
      'Request timeout': 'Se agotó el tiempo de espera. Intenta nuevamente',
    };
    const exact = dictionary[errorMessage];
    if (exact) return exact;
    if (errorMessage.includes('Invalid login credentials')) return 'Credenciales de inicio de sesión inválidas';
    if (errorMessage.includes('Email not confirmed')) return 'Email no confirmado. Revisa tu correo electrónico';
    if (errorMessage.includes('User already registered')) return 'Este email ya está registrado';
    if (errorMessage.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres';
    if (errorMessage.includes('Invalid email')) return 'Dirección de email inválida';
    if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
      return 'Error de conexión. Verifica tu internet e inténtalo nuevamente';
    }
    return errorMessage;
  };

  async function onLogin() {
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = translateError(error.message);
      setMessage(msg);
      if (error.message && error.message.includes('Invalid login credentials')) {
        setMode('register');
      }
      return;
    }
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
    setMessage('Sesión iniciada');
  }
  async function onRegister() {
    setMessage('');
    if (!email || !password) return setMessage('Ingresa email y contraseña');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) return setMessage(translateError(error.message));
    if (data.session && data.user) {
      dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
      setMessage('Registro exitoso');
    } else {
      setMessage('Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
      setMode('login');
    }
  }
  async function onLogout() {
    await supabase.auth.signOut();
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: null, user: null } });
    setMessage('Sesión cerrada');
  }
  async function onRecover() {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage(translateError(error.message));
    else setMessage('Si el correo existe, se envió un enlace (simulado)');
  }
  async function onUpdateProfile() {
    const { data, error } = await supabase.auth.updateUser({});
    if (error) return setMessage(translateError(error.message));
    dispatch({ type: ACTIONS.SET_USER, payload: data.user });
    setMessage('Perfil actualizado');
  }

  const isLogged = !!state.user;

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setMode('login')}>Login</button>{' '}
        <button onClick={() => setMode('register')}>Registro</button>{' '}
        <button onClick={() => setMode('recover')}>Recuperar</button>{' '}
        <button onClick={() => setMode('profile')} disabled={!isLogged}>
          Perfil
        </button>
      </div>

  {mode === 'login' && (
    <div>
      <Field label="Email" value={email} onChange={setEmail} />
      <Field label="Contraseña" type="password" value={password} onChange={setPassword} />
      <button onClick={onLogin}>Entrar</button>
    </div>
  )}
  {mode === 'register' && (
    <div>
      <Field label="Email" value={email} onChange={setEmail} />
      <Field label="Contraseña" type="password" value={password} onChange={setPassword} />
      <button onClick={onRegister}>Crear cuenta</button>
    </div>
  )}
      {mode === 'recover' && (
        <div>
          <Field label="Email" value={email} onChange={setEmail} />
          <button onClick={onRecover}>Enviar enlace</button>
        </div>
      )}
      {mode === 'profile' && isLogged && (
        <div>
          <button onClick={onUpdateProfile}>Guardar</button>{' '}
          <button onClick={onLogout}>Salir</button>
        </div>
      )}

      {message && <div style={{ marginTop: 12, color: '#003399' }}>{message}</div>}
    </div>
  );
}

export default AuthApp;


