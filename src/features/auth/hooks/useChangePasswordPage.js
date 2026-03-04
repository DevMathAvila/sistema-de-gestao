import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser } from '../../../core/auth/session';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { updateUserPassword } from '../services/authService';

const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function useChangePasswordPage() {
  const navigate = useNavigate();
  const { theme } = usePersistentTheme();
  const user = getSessionUser() || { username: '' };
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [updatingSenha, setUpdatingSenha] = useState(false);

  const forcaSenha = useMemo(() => {
    if (!novaSenha) return { nivel: 'Nenhuma', barra: 'bg-slate-400', progresso: 0, forte: false };
    let score = 0;
    if (novaSenha.length >= 8) score += 1;
    if (/[A-Z]/.test(novaSenha)) score += 1;
    if (/\d/.test(novaSenha)) score += 1;
    if (/[^A-Za-z0-9]/.test(novaSenha)) score += 1;
    if (regexSenhaForte.test(novaSenha)) return { nivel: 'Forte/Segura', barra: 'bg-emerald-500', progresso: 100, forte: true };
    if (score >= 2) return { nivel: 'Media', barra: 'bg-amber-400', progresso: 66, forte: false };
    return { nivel: 'Fraca', barra: 'bg-red-500', progresso: 33, forte: false };
  }, [novaSenha]);

  const senhasIguais = novaSenha.length > 0 && novaSenha === confirmarSenha;
  const podeAtualizarSenha = forcaSenha.forte && senhasIguais && !updatingSenha;

  const styles = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    card: theme === 'dark' ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900',
    input: theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-400' : 'text-slate-500',
  }), [theme]);

  const handleAtualizarSenha = async () => {
    if (!podeAtualizarSenha) return;
    setUpdatingSenha(true);
    try {
      const usernameSessao = String(user?.username || '').trim();
      if (!usernameSessao) throw new Error('Usuario logado nao encontrado.');
      await updateUserPassword(usernameSessao, novaSenha);
      alert('Senha atualizada com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      alert(err?.message || 'Nao foi possivel atualizar a senha.');
    } finally {
      setUpdatingSenha(false);
    }
  };

  return {
    navigate,
    theme,
    user,
    novaSenha,
    setNovaSenha,
    confirmarSenha,
    setConfirmarSenha,
    updatingSenha,
    forcaSenha,
    senhasIguais,
    podeAtualizarSenha,
    styles,
    handleAtualizarSenha,
  };
}
