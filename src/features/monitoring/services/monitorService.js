import { supabase } from '../../../core/api/supabaseClient';
import { isTraveInteiraLabel } from '../../failures/constants/failureConstants';

function normalizeText(text) {
  return String(text || '').replace(/\s|-|_/g, '').toLowerCase().trim();
}

export async function fetchOpenFailures() {
  const { data, error } = await supabase
    .from('registros_falhas')
    .select('id, setor, trave, ponto, falha, status');
  if (error) throw error;
  return (data || []).filter((f) => String(f.status || '').toLowerCase().trim() === 'aberto');
}

export function buildMonitorPanel(falhas) {
  const setores = ['Runin 01', 'Runin 02', 'Runin 03', 'Runin 04', 'Runin 05', 'Runin 06', 'Runin 07', 'Runin 08', 'Runin 09', 'Runin 10', 'AVT'];
  return setores
    .map((nome) => {
      const chamados = falhas.filter((f) => normalizeText(f.setor) === normalizeText(nome));
      const resumoFalhas = {};
      chamados.forEach((c) => {
        const falha = c.falha?.toUpperCase() || 'N/D';
        resumoFalhas[falha] = (resumoFalhas[falha] || 0) + 1;
      });
      return {
        nome,
        qtd: chamados.length,
        detalhes: Object.entries(resumoFalhas).sort((a, b) => b[1] - a[1]).slice(0, 2),
        critico: chamados.some((f) => {
          return isTraveInteiraLabel(f.ponto);
        }),
      };
    })
    .filter((s) => s.qtd > 0);
}

export function countCriticalStops(falhas) {
  return falhas.filter((f) => isTraveInteiraLabel(f.ponto)).length;
}
