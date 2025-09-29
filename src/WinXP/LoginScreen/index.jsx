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

function LoginModal({ onClose }) {
  const { supabase, dispatch, ACTIONS } = useAppState();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function onLogin() {
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMessage(error.message);
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
      options: {},
    });
    if (error) return setMessage(error.message);
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: data.user } });
  }
  async function onLoginWithGoogle() {
    try {
      setMessage('');
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) setMessage(error.message);
    } catch (e) { setMessage('No se pudo iniciar con Google'); }
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
                onClick={onLogin}
                style={{
                  background: 'linear-gradient(#e6f0ff,#cfe0ff)',
                  border: '1px solid #7aa2e8',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >Acceder</button>
              <button
                onClick={onLoginWithGoogle}
                style={{ background: 'linear-gradient(#fff,#eee)', border: '1px solid #7aa2e8', padding: '6px 12px', cursor: 'pointer' }}
              >Iniciar con Google</button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12 }}>
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'transparent', border: 0, color: '#003399', cursor: 'pointer' }}>
                {mode === 'login' ? 'Crear nueva cuenta...' : 'Ya tengo cuenta. Iniciar sesión'}
              </button>
            </div>
            {message && <div style={{ color: '#c00', marginTop: 8 }}>{message}</div>}
          </div>
        </div>
      </div>
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


