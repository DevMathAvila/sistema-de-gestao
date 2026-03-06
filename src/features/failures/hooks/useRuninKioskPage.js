import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSessionUser } from '../../../core/auth/session';
import { FALHAS_COMUNS } from '../../../shared/constants/falhasComuns';
import { LISTA_SETORES } from '../../../shared/constants/setores';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { PONTOS, TRAVES } from '../constants/failureConstants';
import { createFalhaRegistro, fetchChamadosAbertosPorSetor } from '../services/failuresService';
import { getFailureTheme } from '../styles/failureTheme';

function parseFalhasDoTexto(raw) {
  return String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useRuninKioskPage() {
  const user = getSessionUser() || { username: 'Runin', setor_fixo: '' };
  const { theme, toggleTheme } = usePersistentTheme();
  const styles = useMemo(() => getFailureTheme(theme), [theme]);
  const setor = useMemo(() => {
    const raw = String(user?.setor_fixo || '').trim();
    return LISTA_SETORES.includes(raw) ? raw : null;
  }, [user?.setor_fixo]);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [chamadosAbertos, setChamadosAbertos] = useState([]);
  const [formData, setFormData] = useState({ trave: '', pontos: [], falhas: [] });

  const loadChamados = useCallback(async () => {
    if (!setor) {
      setChamadosAbertos([]);
      setSyncing(false);
      return;
    }
    try {
      const data = await fetchChamadosAbertosPorSetor(setor);
      setChamadosAbertos(Array.isArray(data) ? data : []);
    } catch {
      setChamadosAbertos([]);
    } finally {
      setSyncing(false);
    }
  }, [setor]);

  useEffect(() => {
    loadChamados();
    const interval = setInterval(loadChamados, 5000);
    return () => clearInterval(interval);
  }, [loadChamados]);

  const traveTemErro = useCallback(
    (numTrave) => chamadosAbertos.some((c) => String(c.trave) === String(numTrave)),
    [chamadosAbertos],
  );

  const getInfoPonto = useCallback((numPonto) => {
    if (!formData.trave) return null;
    const chamadosDestePonto = chamadosAbertos.filter((c) => {
      if (String(c.trave) !== String(formData.trave)) return false;
      const pStr = String(c.ponto || '');
      if (String(pStr).toLowerCase().includes('inteira') || String(pStr).toLowerCase().includes('travetoda') || pStr.includes('1-15') || pStr.includes('1-40')) return true;
      const pontosArray = pStr.split(',').map((p) => p.replace('Ponto ', '').trim());
      return pontosArray.includes(String(numPonto));
    });
    if (chamadosDestePonto.length === 0) return null;
    const falhas = chamadosDestePonto.flatMap((item) => parseFalhasDoTexto(item?.falha));
    return [...new Set(falhas)].join(', ');
  }, [chamadosAbertos, formData.trave]);

  const togglePonto = useCallback((ponto) => {
    setFormData((prev) => ({
      ...prev,
      pontos: prev.pontos.includes(ponto) ? prev.pontos.filter((p) => p !== ponto) : [...prev.pontos, ponto],
    }));
  }, []);

  const toggleFalha = useCallback((falha) => {
    setFormData((prev) => ({
      ...prev,
      falhas: prev.falhas.includes(falha) ? prev.falhas.filter((f) => f !== falha) : [...prev.falhas, falha],
    }));
  }, []);

  const selecionarTodosPontos = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      pontos: prev.pontos.length === PONTOS.length ? [] : PONTOS,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!setor) return;
    if (formData.falhas.length === 0 || formData.pontos.length === 0 || !formData.trave) return;
    setLoading(true);
    try {
      await createFalhaRegistro({
        setor,
        trave: formData.trave,
        pontos: formData.pontos,
        falhas: formData.falhas,
      });
      setFormData({ trave: '', pontos: [], falhas: [] });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1300);
      await loadChamados();
    } catch (err) {
      alert(err?.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  }, [formData.falhas, formData.pontos, formData.trave, loadChamados, setor]);

  return {
    user,
    setor,
    theme,
    styles,
    toggleTheme,
    syncing,
    loading,
    isSuccess,
    formData,
    setFormData,
    traveTemErro,
    getInfoPonto,
    togglePonto,
    toggleFalha,
    selecionarTodosPontos,
    handleSubmit,
    pontos: PONTOS,
    traves: TRAVES,
    falhasComuns: FALHAS_COMUNS,
  };
}
