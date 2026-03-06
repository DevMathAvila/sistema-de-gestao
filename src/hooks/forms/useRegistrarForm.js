import { useEffect, useState } from 'react';
import { inserirRegistrosFalha, listarChamadosAbertosPorSetor } from '../../services/supabaseSecure';

export const LISTA_PONTOS = [...Array(15)].map((_, i) => (i + 1).toString());

export function useRegistrarForm(setor, navigate) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [chamadosAbertos, setChamadosAbertos] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [formData, setFormData] = useState({ trave: '', pontos: [], falhas: [] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await listarChamadosAbertosPorSetor(setor);
      if (!cancelled && !error) setChamadosAbertos(data || []);
    })();
    return () => { cancelled = true; };
  }, [setor]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const traveTemErro = (numTrave) => chamadosAbertos.some((c) => String(c.trave) === String(numTrave));

  const getInfoPonto = (numPonto) => {
    if (!formData.trave) return null;
    const chamadosDestePonto = chamadosAbertos.filter((c) => {
      if (String(c.trave) !== String(formData.trave)) return false;
      const pStr = String(c.ponto || '');
      if (pStr === '1-15 (Inteira)') return true;
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
      pontos: prev.pontos.length === LISTA_PONTOS.length ? [] : LISTA_PONTOS,
    }));
  };

  const setTrave = (trave) => setFormData((prev) => ({ ...prev, trave, pontos: [] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.falhas.length === 0 || formData.pontos.length === 0 || !formData.trave) return;
    setLoading(true);

    try {
      const { error } = await inserirRegistrosFalha(setor, formData.trave, formData.pontos, formData.falhas);
      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => navigate('/abrir-chamado'), 1500);
    } catch (err) {
      alert(err?.message || 'Erro ao registrar.');
      setLoading(false);
    }
  };

  return {
    loading,
    isSuccess,
    chamadosAbertos,
    theme,
    formData,
    setFormData,
    toggleTheme,
    traveTemErro,
    getInfoPonto,
    togglePonto,
    toggleFalha,
    selecionarTodosPontos,
    setTrave,
    handleSubmit,
  };
}
