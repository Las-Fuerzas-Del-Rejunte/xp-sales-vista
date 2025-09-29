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

  async function onLogin() {
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMessage(error.message);
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
    setMessage('Sesión iniciada');
  }
  async function onRegister() {
    setMessage('');
    if (!email || !password) return setMessage('Ingresa email y contraseña');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // No enviamos metadatos; el rol se gestiona desde la tabla profiles
      options: {},
    });
    if (error) return setMessage(error.message);
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
    setMessage('Registro exitoso');
  }
  async function onLogout() {
    await supabase.auth.signOut();
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: null, user: null } });
    setMessage('Sesión cerrada');
  }
  async function onRecover() {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage(error.message);
    else setMessage('Si el correo existe, se envió un enlace (simulado)');
  }
  async function onUpdateProfile() {
    const { data, error } = await supabase.auth.updateUser({});
    if (error) return setMessage(error.message);
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


