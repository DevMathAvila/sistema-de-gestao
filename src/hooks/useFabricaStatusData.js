import { useCallback, useEffect, useState } from 'react';
import { listarFalhasAbertas } from '../services/supabaseSecure';

export function useFabricaStatusData() {
  const [setoresComFalha, setSetoresComFalha] = useState([]);

  const buscarFalhas = useCallback(async () => {
    try {
      const { data, error } = await listarFalhasAbertas();
      if (error) throw error;
      const registrosValidos = (data || []).filter((item) => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map((item) => item.setor))]);
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000);
    return () => clearInterval(interval);
  }, [buscarFalhas]);

  return { setoresComFalha };
}
