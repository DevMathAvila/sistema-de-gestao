import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../core/api/supabaseClient';
import { clearSessionData, setSessionUser } from '../../../core/auth/session';

const EMAIL_DOMAIN = 'lenovo.app';

function normalizeUsername(username) {
  return String(username || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
}

function usernameToEmail(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return '';
  return `${normalized}@${EMAIL_DOMAIN}`;
}

async function fetchProfileByAuthUser(db, authUser) {
  const authUserId = authUser?.id;
  const authEmail = String(authUser?.email || '').toLowerCase();

  const { data: byAuthId, error: byAuthIdError } = await db
    .from('usuarios')
    .select('id, username, role, auth_user_id, force_password_change')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (byAuthIdError) throw byAuthIdError;
  if (byAuthId) return byAuthId;

  // Auto-heal: se auth_user_id estiver faltando, tenta casar pelo username derivado do email.
  const usernameFromEmail = authEmail.split('@')[0];
  if (!usernameFromEmail) throw new Error('Perfil do usuario nao encontrado.');

  const { data: byUsername, error: byUsernameError } = await db
    .from('usuarios')
    .select('id, username, role, auth_user_id, force_password_change')
    .ilike('username', usernameFromEmail)
    .maybeSingle();

  if (byUsernameError) throw byUsernameError;
  if (!byUsername) throw new Error('Perfil do usuario nao encontrado.');

  if (!byUsername.auth_user_id || byUsername.auth_user_id !== authUserId) {
    const { error: repairError } = await db
      .from('usuarios')
      .update({ auth_user_id: authUserId })
      .eq('id', byUsername.id);
    if (repairError) throw repairError;
  }

  return { ...byUsername, auth_user_id: authUserId };
}

function createAuthedClient(accessToken) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function authenticateUser(username, password) {
  const email = usernameToEmail(username);
  if (!email) throw new Error('Usuario invalido.');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) throw error || new Error('Falha ao autenticar.');
  const accessToken = data?.session?.access_token || '';
  if (!accessToken) throw new Error('Sessao nao iniciada corretamente.');

  // Usa client com JWT explicito para evitar bloqueio por RLS no primeiro request apos login.
  const authedClient = createAuthedClient(accessToken);
  const profile = await fetchProfileByAuthUser(authedClient, data.user);
  const saved = setSessionUser({ id: profile.id, username: profile.username, role: profile.role });
  if (!saved) throw new Error('Nao foi possivel criar a sessao.');

  return profile;
}

export function persistRememberUser(rememberMe, username) {
  if (rememberMe) localStorage.setItem('lenovo_remember_user', username);
  else localStorage.removeItem('lenovo_remember_user');
  localStorage.removeItem('lenovo_remember_pass');
}

export async function updateUserPassword(_username, novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData?.session?.access_token || '';
  if (!accessToken) throw new Error('Sessao expirada. Faca login novamente.');

  const { error: flagError } = await supabase.functions.invoke('user-clear-password-flag', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (flagError) {
    // Nao bloquear o usuario apos trocar senha por falha temporaria da function.
    // O fallback operacional e limpar a flag via SQL/edge healthcheck.
    // eslint-disable-next-line no-console
    console.warn('user-clear-password-flag failed:', flagError.message || flagError);
  }
}

export async function logoutUser() {
  try {
    await supabase.auth.signOut();
  } finally {
    clearSessionData();
  }
}
