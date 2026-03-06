import { useState } from 'react';
import { getUsuarioParaLogin } from '../../services/supabaseSecure';
import { setSessionUser } from '../../utils/session';

export function useLoginForm(navigate) {
  const [username, setUsername] = useState(() => {
    try { return localStorage.getItem('lenovo_remember_user') || ''; } catch { return ''; }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('lenovo_remember_user'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: user, error: apiError } = await getUsuarioParaLogin(username, password);
      if (apiError) throw apiError;
      if (!user || user.senha !== password) {
        setError('Usuario ou senha incorretos.');
        return;
      }

      const saved = setSessionUser({ id: user.id, username: user.username, role: user.role });
      if (!saved) throw new Error('Nao foi possivel criar a sessao.');

      if (rememberMe) localStorage.setItem('lenovo_remember_user', user.username);
      else localStorage.removeItem('lenovo_remember_user');

      localStorage.removeItem('lenovo_remember_pass');
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Falha na conexao.');
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loading,
    error,
    handleSubmit,
  };
}
