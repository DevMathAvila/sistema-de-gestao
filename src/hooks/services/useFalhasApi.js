import { useCallback } from 'react';
import * as api from '../../services/supabaseSecure';

export function useFalhasApi() {
  const fetchFalhasAbertas = useCallback(async () => {
    const { data, error } = await api.listarFalhasAbertas();
    if (error) throw error;
    return data || [];
  }, []);

  const fetchHistoricoPorPonto = useCallback(async (setor, trave, ponto, limite = 5) => {
    const { data, error } = await api.listarHistoricoRecentePorPonto(setor, trave, ponto, limite);
    if (error) throw error;
    return data || [];
  }, []);

  const concluirFalhas = useCallback(async (ids, solucao, falhasSelecionadas) => {
    const { error } = await api.fecharRegistros(ids, solucao, falhasSelecionadas);
    if (error) throw error;
  }, []);

  return { fetchFalhasAbertas, fetchHistoricoPorPonto, concluirFalhas };
}
