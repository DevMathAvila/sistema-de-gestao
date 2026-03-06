import {
  finalizarFalhaViaSiga,
  fecharRegistros,
  inserirRegistrosFalha,
  listarChamadosAbertosPorSetor,
  listarFalhasAbertas,
  listarFalhasSigaAguardando,
  listarFalhasSigaFinalizados,
  listarHistoricoRecentePorPonto,
  marcarFalhasComoInoperantes,
  marcarFalhasParaSiga,
  atualizarFalhaInoperante,
  reativarFalhasInoperantes,
  salvarDadosSigaAguardando,
} from '../../../core/api/supabaseSecure';

const OPEN_FAILURES_CACHE_TTL_MS = 4000;
let openFailuresCache = { timestamp: 0, data: [] };
let openFailuresInFlight = null;

function resetOpenFailuresCache() {
  openFailuresCache = { timestamp: 0, data: [] };
  openFailuresInFlight = null;
}

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

export async function fetchFalhasAbertas({ force = false } = {}) {
  const now = Date.now();
  if (!force && openFailuresCache.timestamp && now - openFailuresCache.timestamp < OPEN_FAILURES_CACHE_TTL_MS) {
    return openFailuresCache.data;
  }

  if (openFailuresInFlight) return openFailuresInFlight;

  openFailuresInFlight = listarFalhasAbertas()
    .then(({ data, error }) => {
      if (error) throw error;
      const filtered = (data || []).filter((f) => {
        if (!f.setor || !f.trave) return false;
        const enviadoSiga = Boolean(f?.siga_enviado) || String(f?.siga_status || '').toUpperCase() === 'AGUARDANDO';
        return !enviadoSiga;
      });
      openFailuresCache = { timestamp: Date.now(), data: filtered };
      return filtered;
    })
    .finally(() => {
      openFailuresInFlight = null;
    });

  return openFailuresInFlight;
}

export async function fetchChamadosAbertosPorSetor(setor) {
  const { data, error } = await listarChamadosAbertosPorSetor(setor);
  if (error) throw error;
  return data || [];
}

export async function createFalhaRegistro({ setor, trave, pontos, falhas }) {
  const { error } = await inserirRegistrosFalha(setor, trave, pontos, falhas);
  if (error) throw error;
  resetOpenFailuresCache();
}

export async function concluirFalhas({ ids, solucao, falhasSelecionadas }) {
  const { error } = await fecharRegistros(ids, solucao, falhasSelecionadas);
  if (error) throw error;
  resetOpenFailuresCache();
}

export async function marcarComoInoperante({ ids, falhasSelecionadas, inoperantePayload }) {
  const { error } = await marcarFalhasComoInoperantes(ids, falhasSelecionadas, inoperantePayload);
  if (error) throw error;
  resetOpenFailuresCache();
}

export async function reativarInoperante({ ids }) {
  const { error } = await reativarFalhasInoperantes(ids);
  if (error) throw error;
  resetOpenFailuresCache();
}

export async function atualizarInoperante({ id, data, falha, motivo }) {
  const { error } = await atualizarFalhaInoperante({ id, data, falha, motivo });
  if (error) throw error;
  resetOpenFailuresCache();
}

export async function enviarFalhasParaSiga({ ids }) {
  const { error } = await marcarFalhasParaSiga(ids);
  if (error) throw error;
  resetOpenFailuresCache();
}

export async function fetchSigaAguardando() {
  const { data, error } = await listarFalhasSigaAguardando();
  if (error) throw error;
  return data || [];
}

export async function fetchSigaFinalizados() {
  const { data, error } = await listarFalhasSigaFinalizados();
  if (error) throw error;
  return data || [];
}

export async function concluirSiga({ id, diaAbertura, codigoChamado }) {
  const { error } = await finalizarFalhaViaSiga({ id, diaAbertura, codigoChamado });
  if (error) throw error;
}

export async function salvarRascunhoSiga({ id, diaAbertura, codigoChamado }) {
  const { error } = await salvarDadosSigaAguardando({ id, diaAbertura, codigoChamado });
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
    (f) => normalizeText(f.ponto).includes('travetoda') || normalizeText(f.ponto).includes('inteira') || String(f.ponto).includes('1-15') || String(f.ponto).includes('1-40'),
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
