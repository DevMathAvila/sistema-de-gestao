import { LIMITS, sanitizeString } from '../validation/validation';

const SESSION_KEY = 'lenovo_user';
const REMEMBER_USER_KEY = 'lenovo_remember_user';
const REMEMBER_PASS_KEY = 'lenovo_remember_pass';
const ALLOWED_ROLES = new Set(['master', 'admin', 'tecnico', 'técnico', 'tÃ©cnico', 'colaborador', 'runin_kiosk']);

function normalizeRole(role) {
  const value = sanitizeString(role, 20).toLowerCase();
  if (!ALLOWED_ROLES.has(value)) return 'colaborador';
  if (value === 'técnico' || value === 'tÃ©cnico') return 'tecnico';
  return value;
}

function normalizeSetorFixo(value) {
  const setor = sanitizeString(value, 40).trim();
  return setor || null;
}

function normalizeAuthUserId(value) {
  const authUserId = sanitizeString(value, 120).trim();
  return authUserId || null;
}

export function getSessionUser() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const username = sanitizeString(parsed?.username, LIMITS.MAX_USERNAME).trim();
    if (!username) return null;

    return {
      id: parsed?.id ?? null,
      username,
      role: normalizeRole(parsed?.role),
      setor_fixo: normalizeSetorFixo(parsed?.setor_fixo),
      auth_user_id: normalizeAuthUserId(parsed?.auth_user_id),
    };
  } catch {
    return null;
  }
}

export function setSessionUser(user) {
  const username = sanitizeString(user?.username, LIMITS.MAX_USERNAME).trim();
  if (!username) return false;

  const safeUser = {
    id: user?.id ?? null,
    username,
    role: normalizeRole(user?.role),
    setor_fixo: normalizeSetorFixo(user?.setor_fixo),
    auth_user_id: normalizeAuthUserId(user?.auth_user_id),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return true;
  } catch {
    return false;
  }
}

export function clearSessionData() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_PASS_KEY);
    localStorage.removeItem(REMEMBER_USER_KEY);
  } catch {
    // noop
  }
}

export function isAdminUser(user) {
  return user?.role === 'admin' || user?.role === 'master';
}

export function isMasterUser(user) {
  return user?.role === 'master';
}

export function isRuninKioskUser(user) {
  return user?.role === 'runin_kiosk';
}
