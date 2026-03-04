import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser, isMasterUser } from '../../../core/auth/session';
import { LISTA_SETORES } from '../../../shared/constants/setores';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { carregarAvisos, formatarDataHoje, publicarAviso } from '../services/homeService';

export function useHomePage() {
  const navigate = useNavigate();
  const { theme } = usePersistentTheme();
  const user = getSessionUser() || { username: 'Usuario', role: 'colaborador' };
  const isMaster = isMasterUser(user);

  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [saving, setSaving] = useState(false);

  const hoje = useMemo(formatarDataHoje, []);
  const isBlack = theme === 'black';

  const refreshAvisos = async () => {
    setLoading(true);
    try {
      setAvisos(await carregarAvisos());
    } catch {
      setAvisos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAvisos();
  }, []);

  const handleCriarAviso = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) return;
    setSaving(true);
    try {
      await publicarAviso({ titulo, mensagem });
      setTitulo('');
      setMensagem('');
      await refreshAvisos();
    } catch (err) {
      alert(err?.message || 'Nao foi possivel criar o aviso.');
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return {
    navigate,
    user,
    isMaster,
    avisos,
    loading,
    titulo,
    setTitulo,
    mensagem,
    setMensagem,
    saving,
    hoje,
    setores: LISTA_SETORES,
    isBlack,
    handleCriarAviso,
  };
}
