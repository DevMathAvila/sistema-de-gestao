import { LIMITS, sanitizeString } from './validation';

const SESSION_KEY = 'lenovo_user';
const REMEMBER_USER_KEY = 'lenovo_remember_user';
const REMEMBER_PASS_KEY = 'lenovo_remember_pass';
const ALLOWED_ROLES = new Set(['admin', 'tecnico', 'técnico', 'tÃ©cnico', 'colaborador']);

function normalizeRole(role) {
  const value = sanitizeString(role, 20).toLowerCase();
  return ALLOWED_ROLES.has(value) ? value : 'colaborador';
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
  return user?.role === 'admin';
}

