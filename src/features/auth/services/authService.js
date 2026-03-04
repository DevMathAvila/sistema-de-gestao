import { atualizarSenhaUsuario, getUsuarioParaLogin } from '../../../core/api/supabaseSecure';
import { setSessionUser } from '../../../core/auth/session';

export async function authenticateUser(username, password) {
  const { data: user, error } = await getUsuarioParaLogin(username, password);
  if (error) throw error;
  if (!user || user.senha !== password) {
    throw new Error('Usuario ou senha incorretos.');
  }

  const saved = setSessionUser({ id: user.id, username: user.username, role: user.role });
  if (!saved) throw new Error('Nao foi possivel criar a sessao.');

  return user;
}

export function persistRememberUser(rememberMe, username) {
  if (rememberMe) localStorage.setItem('lenovo_remember_user', username);
  else localStorage.removeItem('lenovo_remember_user');
  localStorage.removeItem('lenovo_remember_pass');
}

export async function updateUserPassword(username, novaSenha) {
  const result = await atualizarSenhaUsuario(String(username || '').trim(), novaSenha);
  if (!result?.success) {
    throw new Error(result?.error?.message || 'Falha ao atualizar senha.');
  }
}
