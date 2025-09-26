// Minimal cliente de Supabase con fallback a modo simulado si no hay claves
// Preparado para análisis estático: evita accesos dinámicos y exporta tipos simples

let createClient = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  ({ createClient } = require('@supabase/supabase-js'));
} catch (_e) {
  createClient = null;
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

function createMockClient() {
  const usersKey = 'app.users';
  const sessionsKey = 'app.session';
  function read(key, def) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : def;
    } catch (e) {
      return def;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const api = {
    auth: {
      async signUp({ email, password, options }) {
        const profile = options && options.data ? options.data : {};
        const users = read(usersKey, []);
        const exists = users.find(u => u.email === email);
        if (exists) return { data: { user: null, session: null }, error: { message: 'Email ya registrado' } };
        const user = {
          id: `usr_${Date.now()}`,
          email,
          role: profile.role || 'Cliente',
          name: profile.name || email.split('@')[0],
        };
        users.push({ ...user, password });
        write(usersKey, users);
        const session = { user };
        write(sessionsKey, session);
        return { data: { user, session }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const users = read(usersKey, []);
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return { data: { user: null, session: null }, error: { message: 'Credenciales inválidas' } };
        const session = { user: { id: user.id, email: user.email, role: user.role, name: user.name } };
        write(sessionsKey, session);
        return { data: { user: session.user, session }, error: null };
      },
      async signOut() {
        localStorage.removeItem(sessionsKey);
        return { error: null };
      },
      async getSession() {
        const s = read(sessionsKey, null);
        return { data: { session: s }, error: null };
      },
      async updateUser(updates) {
        const s = read(sessionsKey, null);
        if (!s || !s.user) return { data: { user: null }, error: { message: 'No autenticado' } };
        const users = read(usersKey, []);
        const idx = users.findIndex(u => u.id === s.user.id);
        if (idx === -1) return { data: { user: null }, error: { message: 'Usuario no encontrado' } };
        const updated = { ...users[idx], ...updates, password: users[idx].password };
        users[idx] = updated;
        write(usersKey, users);
        const userPublic = { id: updated.id, email: updated.email, role: updated.role, name: updated.name };
        write(sessionsKey, { user: userPublic });
        return { data: { user: userPublic }, error: null };
      },
      async resetPasswordForEmail(email) {
        const users = read(usersKey, []);
        const exists = users.some(u => u.email === email);
        return exists ? { data: { ok: true }, error: null } : { data: null, error: { message: 'Email no registrado' } };
      },
    },
  };
  return api;
}

export function getSupabaseClient() {
  if (createClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return createMockClient();
}

export default getSupabaseClient;



