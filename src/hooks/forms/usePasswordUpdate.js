import { useMemo, useState } from 'react';
import { atualizarSenhaUsuario } from '../../services/supabaseSecure';

const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function usePasswordUpdate(user, navigate) {
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

  const handleAtualizarSenha = async () => {
    if (!podeAtualizarSenha) return;
    setUpdatingSenha(true);

    try {
      const usernameSessao = String(user?.username || '').trim();
      if (!usernameSessao) throw new Error('Usuario logado nao encontrado.');

      const result = await atualizarSenhaUsuario(usernameSessao, novaSenha);
      if (!result?.success) throw new Error(result?.error?.message || 'Falha ao atualizar senha.');

      alert('Senha atualizada com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      alert(err?.message || 'Nao foi possivel atualizar a senha.');
    } finally {
      setUpdatingSenha(false);
    }
  };

  return {
    novaSenha,
    setNovaSenha,
    confirmarSenha,
    setConfirmarSenha,
    forcaSenha,
    senhasIguais,
    podeAtualizarSenha,
    updatingSenha,
    handleAtualizarSenha,
  };
}
