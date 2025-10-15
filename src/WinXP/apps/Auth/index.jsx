import React, { useState } from 'react';
import { useAppState } from 'state/AppStateContext';
import 'xp.css/dist/XP.css';

function Field({ label, type = 'text', value, onChange, disabled = false, placeholder }) {
  return (
    <div className="field-row" style={{ alignItems: 'center', marginBottom: 6 }}>
      <label style={{ width: 110, fontSize: 12 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1 }}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}

const PROFILE_KEYS = ['full_name', 'avatar_url'];
const PROFILE_LABELS = {
  full_name: 'Nombre completo',
  avatar_url: 'Avatar URL',
};

function AuthApp() {
  const { supabase, state, dispatch, ACTIONS } = useAppState();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({ full_name: '', avatar_url: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const metadataKeys = PROFILE_KEYS;

  React.useEffect(() => {
    const meta = state.user?.user_metadata ?? {};
    setProfileData({
      full_name: (meta.full_name ?? meta.name ?? '') || '',
      avatar_url: (meta.avatar_url ?? meta.picture ?? '') || '',
    });
  }, [state.user?.id, state.user?.user_metadata]);

  const translateError = (errorMessage) => {
    if (!errorMessage) return '';
    const dictionary = {
      'Invalid login credentials': 'Credenciales de inicio de sesion invalidas',
      'Email not confirmed': 'Debes confirmar tu correo para continuar',
      'User not found': 'Usuario no encontrado',
      'Invalid email': 'Direccion de email invalida',
      'Password should be at least 6 characters': 'La contrasena debe tener al menos 6 caracteres',
      'Password should be at least 6 characters long': 'La contrasena debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email invalido',
      'User already registered': 'Este email ya esta registrado',
      'Signup requires a valid password': 'Debes ingresar una contrasena valida',
      'Failed to fetch': 'Error de conexion. Verifica tu internet e intenta nuevamente',
      'Network request failed': 'Error de red. Intenta nuevamente',
      'Request timeout': 'Se agoto el tiempo de espera. Intenta nuevamente',
    };
    const exact = dictionary[errorMessage];
    if (exact) return exact;
    if (errorMessage.includes('Invalid login credentials')) return dictionary['Invalid login credentials'];
    if (errorMessage.includes('Email not confirmed')) return dictionary['Email not confirmed'];
    if (errorMessage.includes('User already registered')) return dictionary['User already registered'];
    if (errorMessage.includes('Password should be at least')) return dictionary['Password should be at least 6 characters'];
    if (errorMessage.includes('Invalid email')) return dictionary['Invalid email'];
    if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
      return dictionary['Failed to fetch'];
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
    setMessage('Sesion iniciada');
  }

  async function onRegister() {
    setMessage('');
    if (!email || !password) {
      setMessage('Ingresa email y contrasena');
      return;
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
      setMessage('Registro exitoso');
    } else {
      setMessage('Revisa tu correo para confirmar la cuenta antes de iniciar sesion.');
      setMode('login');
    }
  }

  async function onLogout() {
    await supabase.auth.signOut();
    dispatch({ type: ACTIONS.SET_SESSION, payload: { session: null, user: null } });
    setMessage('Sesion cerrada');
  }

  async function onRecover() {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage(translateError(error.message));
    } else {
      setMessage('Si el correo existe, se envio un enlace (simulado)');
    }
  }

  async function onUpdateProfile() {
    if (!state.user) {
      setMessage('Debes iniciar sesion para actualizar el perfil');
      return;
    }
    if (!isProfileDirty) {
      setMessage('No hay cambios para guardar');
      return;
    }
    setIsSavingProfile(true);
    setMessage('');
    const currentMeta = state.user?.user_metadata ?? {};
    const sanitizedData = {};
    metadataKeys.forEach((key) => {
      const nextValue = profileData[key] == null ? '' : String(profileData[key]);
      const previousValue = (() => {
        if (key === 'full_name') {
          return currentMeta.full_name ?? currentMeta.name ?? '';
        }
        if (key === 'avatar_url') {
          return currentMeta.avatar_url ?? currentMeta.picture ?? '';
        }
        return currentMeta[key] ?? '';
      })();
      if (nextValue !== previousValue) {
        sanitizedData[key] = nextValue;
      }
    });
    if (Object.keys(sanitizedData).length === 0) {
      setMessage('No hay cambios para guardar');
      setIsSavingProfile(false);
      return;
    }
    const { data, error } = await supabase.auth.updateUser({ data: sanitizedData });
    if (error) {
      setMessage(translateError(error.message));
    } else {
      dispatch({ type: ACTIONS.SET_USER, payload: data.user });
      setMessage('Perfil actualizado');
    }
    setIsSavingProfile(false);
  }

  const isLogged = !!state.user;

  const tabButtonStyle = (isActive) => ({
    minWidth: 90,
    fontWeight: 'bold',
    background: isActive ? 'linear-gradient(to bottom, #fff6d5 0%, #f0d090 100%)' : undefined,
    borderColor: isActive ? '#d28b20' : undefined,
    boxShadow: isActive ? 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.15)' : undefined,
    cursor: 'pointer',
  });

  const isProfileDirty = React.useMemo(() => {
    if (!state.user) return false;
    const meta = state.user.user_metadata ?? {};
    return metadataKeys.some((key) => {
      const originalValue = (() => {
        if (key === 'full_name') {
          return meta.full_name ?? meta.name ?? '';
        }
        if (key === 'avatar_url') {
          return meta.avatar_url ?? meta.picture ?? '';
        }
        return meta[key] ?? '';
      })();
      return (profileData[key] ?? '') !== originalValue;
    });
  }, [metadataKeys, profileData, state.user]);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(to right, #edede5 0%, #ede8cd 100%)',
        padding: 16,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#f3f2ea',
          border: '1px solid #bdb8a6',
          boxShadow: 'inset 0 1px 0 #fff, 0 1px 4px rgba(0,0,0,0.25)',
          padding: 16,
          display: 'grid',
          gap: 12,
          fontFamily: 'Tahoma, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <button onClick={() => setMode('recover')} style={tabButtonStyle(mode === 'recover')}>
            Recuperar Contraseña
          </button>
          <button
            onClick={() => setMode('profile')}
            disabled={!isLogged}
            style={{
              ...tabButtonStyle(mode === 'profile'),
              opacity: isLogged ? 1 : 0.6,
              cursor: isLogged ? 'pointer' : 'not-allowed',
            }}
          >
            Perfil
          </button>
        </div>

        {mode === 'login' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <Field label="Email" value={email} onChange={setEmail} />
            <Field label="Contrasena" type="password" value={password} onChange={setPassword} />
            <div className="field-row" style={{ justifyContent: 'flex-end' }}>
              <button onClick={onLogin}>Entrar</button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <Field label="Email" value={email} onChange={setEmail} />
            <Field label="Contrasena" type="password" value={password} onChange={setPassword} />
            <div className="field-row" style={{ justifyContent: 'flex-end' }}>
              <button onClick={onRegister}>Crear cuenta</button>
            </div>
          </div>
        )}

        {mode === 'recover' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <Field label="Email" value={email} onChange={setEmail} />
            <div className="field-row" style={{ justifyContent: 'flex-end' }}>
              <button onClick={onRecover}>Enviar enlace</button>
            </div>
          </div>
        )}

        {mode === 'profile' && isLogged && (
          <div style={{ display: 'grid', gap: 8 }}>
            <Field label="Email" value={state.user?.email ?? ''} onChange={() => {}} disabled />
            {metadataKeys.length > 0 ? (
              metadataKeys.map((key) => (
                <Field
                  key={key}
                  label={PROFILE_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())}
                  value={profileData[key] ?? ''}
                  onChange={(val) => setProfileData((prev) => ({ ...prev, [key]: val }))}
                />
              ))
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: '#555',
                  background: '#fff',
                  border: '1px solid #d3d0c3',
                  padding: '6px 8px',
                }}
              >
                No hay datos de perfil guardados. Completa los campos y guarda para registrarlos.
              </div>
            )}
            <div className="field-row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onUpdateProfile} disabled={!isProfileDirty || isSavingProfile}>
                {isSavingProfile ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={onLogout}>Salir</button>
            </div>
          </div>
        )}

        {mode === 'profile' && !isLogged && (
          <div
            style={{
              fontSize: 12,
              color: '#a00',
              background: '#fff',
              border: '1px solid #d3d0c3',
              padding: '6px 8px',
            }}
          >
            Debes iniciar sesion para ver y editar tu perfil.
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: 4,
              padding: '6px 8px',
              background: '#ffffff',
              border: '1px solid #b7c3f3',
              color: message.toLowerCase().includes('error') ? '#cc0000' : '#003399',
              fontSize: 12,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthApp;



