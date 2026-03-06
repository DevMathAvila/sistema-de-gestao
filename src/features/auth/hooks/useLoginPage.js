import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isRuninKioskUser } from '../../../core/auth/session';
import { authenticateUser, persistRememberUser, updateUserPassword } from '../services/authService';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function getPasswordChangedKey(username) {
  return `lenovo_pwd_changed_${String(username || '').toLowerCase()}`;
}

function resolvePostLoginPath(user) {
  return isRuninKioskUser(user) ? '/chamado' : '/dashboard';
}

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
  const [forcePasswordModalOpen, setForcePasswordModalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forcePasswordError, setForcePasswordError] = useState('');
  const [updatingForcedPassword, setUpdatingForcedPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authenticateUser(username, password);
      persistRememberUser(rememberMe, user.username);
      if (user?.force_password_change) {
        const alreadyChangedLocally = localStorage.getItem(getPasswordChangedKey(user.username)) === '1';
        if (alreadyChangedLocally) {
          navigate(resolvePostLoginPath(user), { replace: true });
          return;
        }
        setPendingUser(user);
        setForcePasswordError('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForcePasswordModalOpen(true);
      } else {
        navigate(resolvePostLoginPath(user), { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Falha na conexao.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForcedPassword = async (e) => {
    e.preventDefault();
    setForcePasswordError('');
    if (!pendingUser?.username) {
      setForcePasswordError('Usuario invalido para troca de senha.');
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      setForcePasswordError('Use minimo 8 caracteres, 1 maiuscula, 1 numero e 1 especial.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForcePasswordError('As senhas nao coincidem.');
      return;
    }

    setUpdatingForcedPassword(true);
    try {
      await updateUserPassword(pendingUser.username, newPassword);
      localStorage.setItem(getPasswordChangedKey(pendingUser.username), '1');
      setForcePasswordModalOpen(false);
      setPendingUser(null);
      navigate(resolvePostLoginPath(pendingUser), { replace: true });
    } catch (err) {
      setForcePasswordError(err?.message || 'Falha ao atualizar senha.');
    } finally {
      setUpdatingForcedPassword(false);
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
    forcePasswordModalOpen,
    pendingUser,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    forcePasswordError,
    updatingForcedPassword,
    handleSubmitForcedPassword,
  };
}
