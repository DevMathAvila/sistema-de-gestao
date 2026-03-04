import {
  fecharRegistros,
  inserirRegistrosFalha,
  listarChamadosAbertosPorSetor,
  listarFalhasAbertas,
  listarHistoricoRecentePorPonto,
} from '../../../core/api/supabaseSecure';

export function normalizeText(text) {
  return String(text || '').replace(/\s|-|_/g, '').toLowerCase().trim();
}

export function splitFalhas(rawFalhas) {
  if (Array.isArray(rawFalhas)) {
    return rawFalhas.map((f) => String(f || '').trim()).filter(Boolean);
  }
  return String(rawFalhas || '')
    .split(/[,+]/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export async function fetchFalhasAbertas() {
  const { data, error } = await listarFalhasAbertas();
  if (error) throw error;
  return (data || []).filter((f) => f.setor && f.trave);
}

export async function fetchChamadosAbertosPorSetor(setor) {
  const { data, error } = await listarChamadosAbertosPorSetor(setor);
  if (error) throw error;
  return data || [];
}

export async function createFalhaRegistro({ setor, trave, pontos, falhas }) {
  const { error } = await inserirRegistrosFalha(setor, trave, pontos, falhas);
  if (error) throw error;
}

export async function concluirFalhas({ ids, solucao, falhasSelecionadas }) {
  const { error } = await fecharRegistros(ids, solucao, falhasSelecionadas);
  if (error) throw error;
}

export async function fetchHistoricoPonto({ setor, trave, ponto, limite = 5 }) {
  const { data, error } = await listarHistoricoRecentePorPonto(setor, trave, ponto, limite);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export function buildFalhasDoChamado(chamados) {
  const seen = new Set();
  const out = [];
  chamados.forEach((c) => {
    splitFalhas(c.falha).forEach((nomeFalha) => {
      const key = `${c.id}::${nomeFalha}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ id: c.id, falha: nomeFalha, key });
    });
  });
  return out;
}

export function traveTemParada(chamados) {
  return chamados.some(
    (f) => normalizeText(f.ponto).includes('travetoda') || String(f.ponto).includes('1-15'),
  );
}

export function countFalhasReais(chamados) {
  return chamados.reduce((acc, c) => acc + (splitFalhas(c.falha).length || 1), 0);
}

export function getStatusTrave(chamados) {
  const temParada = traveTemParada(chamados);
  const total = countFalhasReais(chamados);

  if (temParada) return { label: 'TRAVE PARADA', color: 'bg-purple-600', textColor: 'text-white', level: 4 };
  if (total >= 11) return { label: `URGENCIA (${total})`, color: 'bg-red-600', textColor: 'text-white', level: 3 };
  if (total >= 6) return { label: `PRIORIDADE (${total})`, color: 'bg-orange-500', textColor: 'text-white', level: 2 };
  if (total >= 1) return { label: `ATENCAO (${total})`, color: 'bg-yellow-500', textColor: 'text-black', level: 1 };
  return { label: 'OPERACIONAL', color: 'bg-emerald-500', textColor: 'text-white', level: 0 };
}

export function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${min}`;
}
