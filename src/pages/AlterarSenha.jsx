import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Shield } from 'lucide-react';
import { atualizarSenhaUsuario } from '../services/supabaseSecure';
import { getSessionUser } from '../lib/session';

export default function AlterarSenha() {
  const navigate = useNavigate();
  const user = getSessionUser() || { username: '' };
  const [theme] = useState(localStorage.getItem('theme') || 'dark');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [updatingSenha, setUpdatingSenha] = useState(false);

  const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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

  const styles = {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    card: theme === 'dark' ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900',
    input: theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-400' : 'text-slate-500',
  };

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

  return (
    <div className={`min-h-screen ${styles.bg} p-4 sm:p-6 md:p-10`}>
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className={`mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[11px] uppercase tracking-wider ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-100'}`}
        >
          <ArrowLeft size={14} /> Voltar ao Painel
        </button>

        <section className={`${styles.card} border rounded-[2rem] p-6 sm:p-8`}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">Security</p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight">Alterar Senha</h1>
              <p className={`mt-2 text-xs ${styles.subtext}`}>Acesso seguro para {user?.username || 'usuario'}.</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center">
              <Shield size={20} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 ${styles.subtext}`}>Nova senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha"
                className={`${styles.input} w-full px-5 py-4 rounded-2xl border outline-none text-sm font-bold`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 ${styles.subtext}`}>Confirmar nova senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                className={`${styles.input} w-full px-5 py-4 rounded-2xl border outline-none text-sm font-bold`}
              />
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${styles.subtext}`}>Forca da senha</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${forcaSenha.forte ? 'text-emerald-500' : forcaSenha.nivel === 'Media' ? 'text-amber-500' : 'text-red-500'}`}>{forcaSenha.nivel}</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div className={`h-full transition-all duration-300 ${forcaSenha.barra}`} style={{ width: `${forcaSenha.progresso}%` }} />
              </div>
              <p className={`mt-2 text-[10px] font-black uppercase tracking-wider ${styles.subtext}`}>
                Minimo 8 caracteres, 1 letra maiuscula, 1 numero e 1 caractere especial.
              </p>
            </div>

            {confirmarSenha.length > 0 && !senhasIguais && (
              <p className="text-[10px] font-black uppercase tracking-wider text-red-500">As senhas nao coincidem.</p>
            )}

            <button
              type="button"
              onClick={handleAtualizarSenha}
              disabled={!podeAtualizarSenha}
              className={`w-full px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
                podeAtualizarSenha
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <KeyRound size={14} /> {updatingSenha ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
