import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, persistRememberUser } from '../services/authService';

export function useLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('lenovo_remember_user') || '';
    } catch {
      return '';
    }
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
      const user = await authenticateUser(username, password);
      persistRememberUser(rememberMe, user.username);
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
