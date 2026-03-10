import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSessionUser, isAdminUser } from '../../../core/auth/session';
import { FALHAS_COMUNS } from '../../../shared/constants/falhasComuns';
import { LISTA_SETORES } from '../../../shared/constants/setores';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { getPontosBySetor, getTravesBySetor, isAvtSetor, isTraveInteiraLabel } from '../constants/failureConstants';
import { createFalhaRegistro, fetchChamadosAbertosPorSetor } from '../services/failuresService';
import { getFailureTheme } from '../styles/failureTheme';

function isTraveInteiraRegistro(pontoRaw) {
  return isTraveInteiraLabel(pontoRaw);
}

export function useRegistrarFalhaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = usePersistentTheme();
  const styles = useMemo(() => getFailureTheme(theme), [theme]);

  const setor = useMemo(() => {
    const s = location.state?.setor;
    return s && LISTA_SETORES.includes(s) ? s : LISTA_SETORES[0] ?? 'Setor nao selecionado';
  }, [location.state]);

  const pontos = useMemo(() => getPontosBySetor(setor), [setor]);
  const traves = useMemo(() => getTravesBySetor(setor), [setor]);
  const setorEhAvt = useMemo(() => isAvtSetor(setor), [setor]);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [chamadosAbertos, setChamadosAbertos] = useState([]);
  const [formData, setFormData] = useState({ trave: '', pontos: [], falhas: [] });
  const isAdmin = isAdminUser(getSessionUser() || { role: 'colaborador' });

  const getInitialFormData = useCallback(() => ({
    trave: setorEhAvt ? 1 : '',
    pontos: [],
    falhas: [],
  }), [setorEhAvt]);

  const carregarChamadosAbertos = useCallback(async () => {
    try {
      const data = await fetchChamadosAbertosPorSetor(setor);
      setChamadosAbertos(data);
    } catch {
      setChamadosAbertos([]);
    }
  }, [setor]);

  useEffect(() => {
    if (setorEhAvt) {
      setFormData((prev) => ({
        ...prev,
        trave: setorEhAvt ? 1 : prev.trave,
      }));
    }
  }, [setorEhAvt]);

  useEffect(() => {
    carregarChamadosAbertos();
  }, [carregarChamadosAbertos]);

  const traveTemErro = (numTrave) => chamadosAbertos.some((c) => String(c.trave) === String(numTrave));

  const getInfoPonto = (numPonto) => {
    if (!formData.trave) return null;
    const chamadosDestePonto = chamadosAbertos.filter((c) => {
      if (String(c.trave) !== String(formData.trave)) return false;
      const pStr = String(c.ponto || '');
      if (isTraveInteiraRegistro(pStr)) return true;
      const pontosArray = pStr.split(',').map((p) => p.replace('Ponto ', '').trim());
      return pontosArray.includes(String(numPonto));
    });
    if (chamadosDestePonto.length === 0) return null;
    const todasFalhas = chamadosDestePonto.map((c) => c.falha).join(', ');
    return [...new Set(todasFalhas.split(', ').map((f) => f.trim()))].join(', ');
  };

  const togglePonto = (ponto) => {
    setFormData((prev) => ({
      ...prev,
      pontos: prev.pontos.includes(ponto) ? prev.pontos.filter((p) => p !== ponto) : [...prev.pontos, ponto],
    }));
  };

  const toggleFalha = (falha) => {
    setFormData((prev) => ({
      ...prev,
      falhas: prev.falhas.includes(falha) ? prev.falhas.filter((f) => f !== falha) : [...prev.falhas, falha],
    }));
  };

  const selecionarTodosPontos = () => {
    setFormData((prev) => ({
      ...prev,
      pontos: prev.pontos.length === pontos.length ? [] : pontos,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.falhas.length === 0 || formData.pontos.length === 0 || !formData.trave) return;
    setLoading(true);
    try {
      await createFalhaRegistro({
        setor,
        trave: formData.trave,
        pontos: formData.pontos,
        falhas: formData.falhas,
      });
      setIsSuccess(true);
      await carregarChamadosAbertos();
      setTimeout(() => {
        setFormData(getInitialFormData());
        setIsSuccess(false);
        setLoading(false);
      }, 1500);
    } catch (err) {
      alert(err?.message || 'Erro ao registrar.');
      setLoading(false);
    }
  };

  return {
    setor,
    setorEhAvt,
    loading,
    isSuccess,
    chamadosAbertos,
    formData,
    setFormData,
    isAdmin,
    theme,
    styles,
    toggleTheme,
    traveTemErro,
    getInfoPonto,
    togglePonto,
    toggleFalha,
    selecionarTodosPontos,
    handleSubmit,
    navigate,
    traves,
    pontos,
    falhasComuns: FALHAS_COMUNS,
  };
}
