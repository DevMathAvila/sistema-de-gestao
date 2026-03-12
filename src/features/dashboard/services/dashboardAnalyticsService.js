import {
  listarOcorrenciasConcluidas,
  listarRegistrosInseridosNoSistema,
  listarRegistrosAbertos,
  listarRegistrosParaKPI,
} from '../../../core/api/supabaseSecure.js';
import { EXPECTED_MAINTENANCE_DAYS } from '../constants/maintenance.js';

const CORES_PIE = ['#dc2626', '#16a34a'];
const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';
const BRAZIL_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRAZIL_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const BRAZIL_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRAZIL_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function normalizeStatus(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function isConcludedRecord(item) {
  return normalizeStatus(item?.status).includes('conclu');
}

function isOpenRecord(item) {
  return normalizeStatus(item?.status).includes('aberto');
}

function splitFalhas(raw) {
  return String(raw || '')
    .split(/[,+]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeLabel(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatDateBr(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return BRAZIL_DATE_FORMATTER.format(dt);
}

function formatDateTimeBr(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return BRAZIL_DATE_TIME_FORMATTER.format(dt);
}

function toValidDate(value) {
  const dt = new Date(value || '');
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatDurationHours(hours) {
  if (!Number.isFinite(hours) || hours < 0) return '-';
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;

  if (totalMinutes < 24 * 60) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  const d = Math.floor(totalMinutes / (24 * 60));
  const rem = totalMinutes % (24 * 60);
  const h = Math.floor(rem / 60);
  if (h === 0) return `${d} dias`;
  return `${d}d ${h}h`;
}

function extractOpenedAt(item) {
  return item?.data || item?.aberto_em || item?.created_at || null;
}

function computeAging(openedAt, nowDate) {
  const opened = new Date(openedAt || '');
  if (Number.isNaN(opened.getTime())) {
    return {
      openedDate: null,
      openedLabel: '-',
      agingMs: null,
      agingHours: null,
      agingDays: null,
      agingLabel: 'Data invalida',
    };
  }

  const rawMs = nowDate.getTime() - opened.getTime();
  const agingMs = Math.max(0, rawMs);
  const agingHours = agingMs / (1000 * 60 * 60);
  const agingDays = agingHours / 24;
  const agingLabel = agingHours < 24 ? `${agingHours.toFixed(1)}h` : `${agingDays.toFixed(1)} dias`;

  return {
    openedDate: opened,
    openedLabel: formatDateBr(opened),
    agingMs,
    agingHours,
    agingDays,
    agingLabel,
  };
}

function parseEvent(item) {
  return {
    tipo: splitFalhas(item?.falha).join(', ') || '-',
    data: item?.resolvido_em || item?.data || null,
    dataLabel: formatDateBr(item?.resolvido_em || item?.data || null),
    tecnico: item?.resolvido_por || item?.usuario || '-',
    solucao: item?.solucao || '-',
  };
}

function getOperationTypeLabel(value) {
  const label = normalizeLabel(value);
  if (!label) return 'Outros';
  if (label.includes('rj45') || label.includes('rede') || label.includes('cabeamento') || label.includes('switch')) return 'Cabeamento / Rede';
  if (label.includes('hdmi') || label.includes('vga') || label.includes('displayport') || label.includes('video')) return 'Video / Conectividade';
  if (label.includes('energia') || label.includes('fonte') || label.includes('alimentacao')) return 'Energia';
  if (label.includes('monitor')) return 'Monitoria';
  if (label.includes('instal')) return 'Instalacao';
  if (label.includes('infra') || label.includes('servidor') || label.includes('rack')) return 'Infraestrutura';
  return 'Outros';
}

function buildOperationTypeDistribution(registros) {
  const totals = {};

  (registros || []).forEach((registro) => {
    splitFalhas(registro?.falha).forEach((falha) => {
      const tipo = getOperationTypeLabel(falha);
      totals[tipo] = (totals[tipo] || 0) + 1;
    });
  });

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function buildSetorStatusResumo(registros) {
  const grouped = {};

  (registros || []).forEach((registro) => {
    const setor = registro?.setor || 'N/I';
    if (!grouped[setor]) {
      grouped[setor] = { setor, pendentes: 0, concluidas: 0, total: 0 };
    }

    grouped[setor].total += 1;
    if (isOpenRecord(registro)) grouped[setor].pendentes += 1;
    if (isConcludedRecord(registro)) grouped[setor].concluidas += 1;
  });

  return Object.values(grouped).sort((a, b) => b.pendentes - a.pendentes || b.total - a.total);
}

function formatSetorLabel(value) {
  const text = String(value || 'N/I').trim();
  const match = text.match(/^runin\s*(\d+)$/i);
  if (match) return `Run in ${String(match[1]).padStart(2, '0')}`;
  return text;
}

function buildExecutiveHighlight(setorStatusResumo, concluidasRows, abertasRows, abertasAtuaisRows) {
  const conclusoesPorSetor = {};

  (concluidasRows || []).forEach((row) => {
    const setor = row?.setor || 'N/I';
    conclusoesPorSetor[setor] = (conclusoesPorSetor[setor] || 0) + 1;
  });

  const rankingConclusoes = Object.entries(conclusoesPorSetor)
    .map(([setor, concluidas]) => ({ setor, concluidas }))
    .sort((a, b) => b.concluidas - a.concluidas);

  const focoConcluido = rankingConclusoes[0] || null;
  if (!focoConcluido) {
    return {
      criticalPoint: {
        setor: 'Operacao geral',
        trave: '-',
        ponto: '-',
        falhas: 0,
      },
      pendingCount: 0,
      resolvedCount: 0,
      remainingCount: 0,
      affectedBars: 0,
      topFailure: '-',
      summary: 'No periodo analisado, nao houve volume suficiente de ocorrencias para destacar uma celula critica.',
    };
  }

  const registrosDoSetorNoPeriodo = [...(concluidasRows || []), ...(abertasRows || [])].filter((row) => {
    return (row?.setor || 'N/I') === focoConcluido.setor;
  });
  const abertasAtuaisDoSetor = (abertasAtuaisRows || []).filter((row) => {
    return (row?.setor || 'N/I') === focoConcluido.setor && isOpenRecord(row);
  });

  const topFailureMap = {};
  const traveFailureMap = {};
  const concludedTraveSet = new Set();
  const remainingTraveSet = new Set();

  registrosDoSetorNoPeriodo.forEach((row) => {
    const trave = row?.trave;
    if (trave == null || trave === '') return;

    const falhas = splitFalhas(row?.falha);
    const traveKey = `${focoConcluido.setor}|${trave}`;
    traveFailureMap[traveKey] = (traveFailureMap[traveKey] || 0) + (falhas.length || 1);
  });

  (concluidasRows || []).forEach((row) => {
    if ((row?.setor || 'N/I') !== focoConcluido.setor) return;

    if (row?.trave != null && row?.trave !== '') {
      concludedTraveSet.add(String(row.trave));
    }

    splitFalhas(row?.falha).forEach((falha) => {
      topFailureMap[falha] = (topFailureMap[falha] || 0) + 1;
    });
  });

  const pendentesRestantes = abertasAtuaisDoSetor.reduce((acc, row) => {
    if (row?.trave != null && row?.trave !== '') {
      remainingTraveSet.add(String(row.trave));
    }
    return acc + Math.max(splitFalhas(row?.falha).length, 1);
  }, 0);

  const traveMaisCritica = Object.entries(traveFailureMap)
    .map(([key, falhas]) => {
      const [setor, trave] = key.split('|');
      return { key, setor, trave, falhas };
    })
    .sort((a, b) => b.falhas - a.falhas || String(a.trave).localeCompare(String(b.trave)))[0] || null;
  const affectedBars = concludedTraveSet.size;
  const remainingAffectedBars = remainingTraveSet.size;
  const topFailure = Object.entries(topFailureMap)
    .map(([falha, total]) => ({ falha, total }))
    .sort((a, b) => b.total - a.total || a.falha.localeCompare(b.falha))[0]?.falha || 'sem falha dominante';
  const resumoSetor = (setorStatusResumo || []).find((item) => item.setor === focoConcluido.setor) || null;
  const totalConcluidas = focoConcluido.concluidas || resumoSetor?.concluidas || 0;
  const criticalPoint = traveMaisCritica
    ? {
        setor: formatSetorLabel(traveMaisCritica.setor),
        trave: String(traveMaisCritica.trave ?? '-').padStart(2, '0'),
        ponto: '-',
        falhas: traveMaisCritica.falhas || 0,
      }
    : {
        setor: formatSetorLabel(focoConcluido.setor),
        trave: '-',
        ponto: '-',
        falhas: 0,
      };
  const summary = pendentesRestantes > 0
    ? `No periodo analisado, o maior volume de conclusoes ficou concentrado em ${formatSetorLabel(focoConcluido.setor)}, com ${totalConcluidas} falhas finalizadas. Ainda restam ${pendentesRestantes} falhas abertas para esta celula, distribuidas em ${remainingAffectedBars} traves, enquanto ${affectedBars} traves receberam conclusoes no periodo.`
    : `No periodo analisado, o maior volume de conclusoes ficou concentrado em ${formatSetorLabel(focoConcluido.setor)}, com ${totalConcluidas} falhas finalizadas e sem pendencias abertas restantes para esta celula.`;

  return {
    criticalPoint,
    pendingCount: pendentesRestantes,
    resolvedCount: totalConcluidas,
    remainingCount: pendentesRestantes,
    affectedBars,
    remainingAffectedBars,
    topFailure,
    summary,
  };
}

function getSigaPriorityLabel(item) {
  const falha = normalizeLabel(item?.falha);
  const ponto = normalizeLabel(item?.ponto);

  if (ponto.includes('travetoda') || ponto.includes('inteira')) return 'Critica';
  if (falha.includes('rj45') || falha.includes('energia') || falha.includes('switch')) return 'Alta';
  if (falha.includes('hdmi') || falha.includes('vga') || falha.includes('monitor')) return 'Media';
  return 'Normal';
}

function shortenDescription(value, max = 46) {
  const text = String(value || '-').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function isSigaWaiting(item) {
  if (!item) return false;
  const enviado = Boolean(item.siga_enviado);
  const status = String(item.siga_status || '').toUpperCase();
  return enviado || status === 'AGUARDANDO';
}

function isSigaFinalized(item) {
  if (!item) return false;
  const enviado = Boolean(item.siga_enviado);
  const status = String(item.siga_status || '').toUpperCase();
  return enviado || status === 'FINALIZADO';
}

function getSigaOpenedAt(item) {
  // Usa preferencialmente timestamp real de envio para SIGA.
  // `siga_data_abertura` e um campo de data sem hora (00:00), que distorce o tempo.
  return item?.siga_enviado_em || item?.data || item?.siga_data_abertura || null;
}

function getSigaClosedAt(item) {
  return item?.siga_finalizado_em || item?.resolvido_em || null;
}

function computeTempoSemManutencao(concluidasRows) {
  const groups = {};
  concluidasRows.forEach((row) => {
    const key = `${row?.setor || 'N/I'}|${row?.trave ?? '-'}|${row?.ponto || '-'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(new Date(row?.resolvido_em || row?.data || ''));
  });

  const diffs = [];
  Object.values(groups).forEach((dates) => {
    const valid = dates.filter((d) => !Number.isNaN(d.getTime())).sort((a, b) => a - b);
    for (let i = 1; i < valid.length; i += 1) {
      const days = (valid[i] - valid[i - 1]) / (1000 * 60 * 60 * 24);
      if (Number.isFinite(days) && days >= 0) diffs.push(days);
    }
  });

  if (!diffs.length) return { mediaDias: null, label: 'Sem base historica' };
  const avg = diffs.reduce((acc, v) => acc + v, 0) / diffs.length;
  return { mediaDias: avg, label: `${avg.toFixed(1)} dias` };
}

function computeAtendimentoGeral(concluidasRows) {
  const samples = (concluidasRows || [])
    .map((row) => {
      const opened = toValidDate(row?.data);
      const closed = toValidDate(row?.resolvido_em);
      if (!opened || !closed) return null;
      const hours = (closed.getTime() - opened.getTime()) / (1000 * 60 * 60);
      if (!Number.isFinite(hours) || hours < 0) return null;
      return hours;
    })
    .filter((hours) => Number.isFinite(hours));

  if (samples.length === 0) {
    return {
      totalHoras: null,
      mediaHoras: null,
      maxHoras: null,
      totalLabel: '-',
      mediaLabel: '-',
      maxLabel: '-',
      totalChamados: 0,
    };
  }

  const totalHoras = samples.reduce((sum, value) => sum + value, 0);
  const mediaHoras = totalHoras / samples.length;
  const maxHoras = Math.max(...samples);

  return {
    totalHoras,
    mediaHoras,
    maxHoras,
    totalLabel: formatDurationHours(totalHoras),
    mediaLabel: formatDurationHours(mediaHoras),
    maxLabel: formatDurationHours(maxHoras),
    totalChamados: samples.length,
  };
}

function computeInativeDurationLabel(inicio, fim = null, nowDate = new Date()) {
  const dtInicio = toValidDate(inicio);
  if (!dtInicio) return '-';
  const dtFim = toValidDate(fim) || nowDate;
  const hours = Math.max(0, (dtFim.getTime() - dtInicio.getTime()) / (1000 * 60 * 60));
  return formatDurationHours(hours);
}

export async function fetchDashboardDataset(dataInicio, dataFim) {
  const [kpiRes, concluidasRes, abertasRes, abertasAtuaisRes, inseridosRes] = await Promise.all([
    listarRegistrosParaKPI(dataInicio || null, dataFim || null),
    listarOcorrenciasConcluidas(dataInicio || null, dataFim || null),
    listarRegistrosAbertos(dataInicio || null, dataFim || null),
    listarRegistrosAbertos(),
    listarRegistrosInseridosNoSistema(dataInicio || null, dataFim || null),
  ]);

  const errors = {
    kpi: kpiRes?.error || null,
    concluidas: concluidasRes?.error || null,
    abertas: abertasRes?.error || null,
    abertasAtuais: abertasAtuaisRes?.error || null,
    inseridos: inseridosRes?.error || null,
  };

  const hasAnyError = Boolean(errors.kpi || errors.concluidas || errors.abertas || errors.abertasAtuais || errors.inseridos);
  const hasKpiError = Boolean(errors.kpi);

  return {
    kpiRows: Array.isArray(kpiRes?.data) ? kpiRes.data : [],
    concluidasRows: Array.isArray(concluidasRes?.data) ? concluidasRes.data : [],
    abertasRows: Array.isArray(abertasRes?.data) ? abertasRes.data : [],
    abertasAtuaisRows: Array.isArray(abertasAtuaisRes?.data) ? abertasAtuaisRes.data : [],
    inseridosRows: Array.isArray(inseridosRes?.data) ? inseridosRes.data : [],
    errors,
    hasAnyError,
    hasKpiError,
  };
}

export function computeDashboardMetrics(
  kpiRows,
  concluidasRows,
  abertasRows,
  inseridosRows = [],
  referenceNow = null,
  abertasAtuaisRows = null
) {
  const registros = Array.isArray(kpiRows) ? kpiRows : [];
  const nowDate = referenceNow instanceof Date ? referenceNow : new Date();
  const abertasParaDestaque = Array.isArray(abertasAtuaisRows) ? abertasAtuaisRows : abertasRows;
  const totalGeral = registros.length;
  const totalPendentes = registros.filter((r) => isOpenRecord(r)).length;
  const totalConcluidas = registros.filter((r) => isConcludedRecord(r)).length;
  const chamadosInseridosNoSistema = Array.isArray(inseridosRows) ? inseridosRows.length : 0;

  const setorCount = {};
  registros.forEach((r) => {
    const setor = r?.setor || 'N/I';
    setorCount[setor] = (setorCount[setor] || 0) + 1;
  });
  const porSetor = Object.entries(setorCount)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const porStatus = [
    { name: 'Pendentes', value: totalPendentes, fill: CORES_PIE[0] },
    { name: 'Concluidas', value: totalConcluidas, fill: CORES_PIE[1] },
  ].filter((d) => d.value > 0);

  const falhaCount = {};
  registros.forEach((r) => {
    splitFalhas(r?.falha).forEach((key) => {
      falhaCount[key] = (falhaCount[key] || 0) + 1;
    });
  });
  const top5 = Object.entries(falhaCount)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const operationTypeDistribution = buildOperationTypeDistribution(registros);
  const topCategory = operationTypeDistribution[0] || { name: 'Sem categoria', value: 0 };
  const setorStatusResumo = buildSetorStatusResumo(registros);
  const executiveHighlight = buildExecutiveHighlight(
    setorStatusResumo,
    concluidasRows || [],
    abertasRows || [],
    abertasParaDestaque || []
  );

  const setorFalhas = {};
  registros.forEach((r) => {
    const setor = r?.setor || 'N/I';
    if (!setorFalhas[setor]) setorFalhas[setor] = {};
    splitFalhas(r?.falha).forEach((f) => {
      setorFalhas[setor][f] = (setorFalhas[setor][f] || 0) + 1;
    });
  });

  const setorInsights = Object.entries(setorFalhas).map(([setor, mapa]) => {
    const topFalhas = Object.entries(mapa)
      .map(([falha, total]) => ({ falha, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    return { setor, topFalhas };
  });

  const pointMap = {};
  (concluidasRows || []).forEach((row) => {
    const key = `${row?.setor || 'N/I'}|${row?.trave ?? '-'}|${row?.ponto || '-'}`;
    if (!pointMap[key]) pointMap[key] = [];
    pointMap[key].push(parseEvent(row));
  });

  const pontosHistorico = Object.entries(pointMap)
    .map(([key, eventos]) => {
      const [setor, trave, ponto] = key.split('|');
      const ordenados = eventos
        .slice()
        .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
      return { setor, trave, ponto, totalEventos: ordenados.length, eventos: ordenados };
    })
    .sort((a, b) => b.totalEventos - a.totalEventos)
    .slice(0, 8);

  const pontosStatusMap = {};
  registros.forEach((row) => {
    const key = `${row?.setor || 'N/I'}|${row?.trave ?? '-'}|${row?.ponto || '-'}`;
    if (!pontosStatusMap[key]) {
      pontosStatusMap[key] = {
        setor: row?.setor || 'N/I',
        trave: row?.trave ?? '-',
        ponto: row?.ponto || '-',
        pendentes: 0,
        concluidas: 0,
      };
    }

    if (isOpenRecord(row)) pontosStatusMap[key].pendentes += 1;
    if (isConcludedRecord(row)) pontosStatusMap[key].concluidas += 1;
  });

  const pontosStatusResumo = Object.values(pontosStatusMap)
    .sort((a, b) => (b.pendentes + b.concluidas) - (a.pendentes + a.concluidas))
    .slice(0, 10);

  const pendingAging = (abertasRows || [])
    .map((row, index) => {
      const openedAt = extractOpenedAt(row);
      const aging = computeAging(openedAt, nowDate);
      const aboveSla = Number.isFinite(aging.agingDays) && aging.agingDays > EXPECTED_MAINTENANCE_DAYS;
      return {
        id: row?.id || `${row?.setor || 'N/I'}-${row?.trave ?? '-'}-${row?.ponto || '-'}-${index}`,
        setor: row?.setor || 'N/I',
        trave: row?.trave ?? '-',
        ponto: row?.ponto || '-',
        falha: splitFalhas(row?.falha).join(', ') || '-',
        openedAt,
        openedLabel: aging.openedLabel,
        agingMs: aging.agingMs,
        agingHours: aging.agingHours,
        agingDays: aging.agingDays,
        agingLabel: aging.agingLabel,
        aboveSla,
      };
    })
    .sort((a, b) => {
      if (a.aboveSla !== b.aboveSla) return a.aboveSla ? -1 : 1;
      return (b.agingMs || 0) - (a.agingMs || 0);
    });

  const sigaChamadosAbertos = (abertasRows || [])
    .filter((row) => isSigaWaiting(row))
    .map((row, idx) => ({
      id: row?.id || `siga-${idx}`,
      setor: row?.setor || 'N/I',
      trave: row?.trave ?? '-',
      ponto: row?.ponto || '-',
      falha: splitFalhas(row?.falha).join(', ') || '-',
      enviadoEm: row?.siga_enviado_em || row?.data || null,
      enviadoEmLabel: formatDateTimeBr(row?.siga_enviado_em || row?.data),
      codigoChamado: row?.siga_codigo_chamado || '-',
      status: String(row?.siga_status || 'AGUARDANDO').toUpperCase(),
    }))
    .sort((a, b) => new Date(b.enviadoEm || 0) - new Date(a.enviadoEm || 0));

  const sigaAtendimentoEmAndamento = sigaChamadosAbertos
    .map((row) => {
      const opened = toValidDate(row?.enviadoEm);
      if (!opened) return null;
      const hours = Math.max(0, (nowDate.getTime() - opened.getTime()) / (1000 * 60 * 60));
      return {
        id: row.id,
        hours,
        label: formatDurationHours(hours),
      };
    })
    .filter(Boolean);

  const sigaChamadosFinalizados = (concluidasRows || [])
    .filter((row) => isSigaFinalized(row))
    .map((row, idx) => {
      const openedAt = getSigaOpenedAt(row);
      const closedAt = getSigaClosedAt(row);
      const openedDate = toValidDate(openedAt);
      const closedDate = toValidDate(closedAt);
      const atendimentoHours = openedDate && closedDate
        ? Math.max(0, (closedDate.getTime() - openedDate.getTime()) / (1000 * 60 * 60))
        : null;

      return {
        id: row?.id || `siga-final-${idx}`,
        setor: row?.setor || 'N/I',
        trave: row?.trave ?? '-',
        ponto: row?.ponto || '-',
        falha: splitFalhas(row?.falha).join(', ') || '-',
        codigoChamado: row?.siga_codigo_chamado || '-',
        abertoEm: openedAt,
        abertoEmLabel: formatDateTimeBr(openedAt),
        fechadoEm: closedAt,
        fechadoEmLabel: formatDateTimeBr(closedAt),
        atendimentoHours,
        atendimentoLabel: formatDurationHours(atendimentoHours),
      };
    })
    .sort((a, b) => new Date(b.fechadoEm || 0) - new Date(a.fechadoEm || 0));
  const sigaTrackingRows = [...sigaChamadosAbertos, ...sigaChamadosFinalizados]
    .slice(0, 10)
    .map((item) => ({
      id: item.codigoChamado && item.codigoChamado !== '-' ? item.codigoChamado : item.id,
      descricao: shortenDescription(item.falha),
      statusAtual: item.status || (item.fechadoEm ? 'FINALIZADO' : 'AGUARDANDO'),
      prioridade: getSigaPriorityLabel(item),
    }));

  const atendimentoSamplesFinalizados = sigaChamadosFinalizados
    .map((item) => item.atendimentoHours)
    .filter((hours) => Number.isFinite(hours));
  const atendimentoSamples = [...atendimentoSamplesFinalizados];

  const atendimentoTotalHoras = atendimentoSamples.reduce((sum, value) => sum + value, 0);
  const atendimentoMedioHoras = atendimentoSamples.length ? atendimentoTotalHoras / atendimentoSamples.length : null;
  const atendimentoMaxHoras = atendimentoSamples.length ? Math.max(...atendimentoSamples) : null;
  const sigaChamadosPendentes = sigaChamadosAbertos.length;
  const sigaChamadosFechados = sigaChamadosFinalizados.length;
  const sigaChamadosAbertosTotais = sigaChamadosPendentes + sigaChamadosFechados;

  const sigaResumo = {
    chamadosAbertosTotais: sigaChamadosAbertosTotais,
    chamadosPendentes: sigaChamadosPendentes,
    chamadosFechados: sigaChamadosFechados,
    atendimentoTotalHoras,
    atendimentoTotalLabel: formatDurationHours(atendimentoTotalHoras),
    atendimentoMedioHoras,
    atendimentoMedioLabel: formatDurationHours(atendimentoMedioHoras),
    atendimentoMaxHoras,
    atendimentoMaxLabel: formatDurationHours(atendimentoMaxHoras),
    chamadosEmAndamento: sigaAtendimentoEmAndamento.length,
  };

  const setorAgingMap = {};
  pendingAging.forEach((item) => {
    if (!setorAgingMap[item.setor]) {
      setorAgingMap[item.setor] = {
        setor: item.setor,
        pendentes: 0,
        acimaSla: 0,
        somaHoras: 0,
        maxAgingHoras: 0,
      };
    }
    setorAgingMap[item.setor].pendentes += 1;
    setorAgingMap[item.setor].acimaSla += item.aboveSla ? 1 : 0;
    setorAgingMap[item.setor].somaHoras += item.agingHours || 0;
    setorAgingMap[item.setor].maxAgingHoras = Math.max(setorAgingMap[item.setor].maxAgingHoras, item.agingHours || 0);
  });

  const setorAgingResumo = Object.values(setorAgingMap)
    .map((item) => ({
      ...item,
      mediaHoras: item.pendentes ? item.somaHoras / item.pendentes : 0,
      maxAgingLabel: item.maxAgingHoras < 24 ? `${item.maxAgingHoras.toFixed(1)}h` : `${(item.maxAgingHoras / 24).toFixed(1)} dias`,
      mediaLabel: item.pendentes
        ? item.somaHoras / item.pendentes < 24
          ? `${(item.somaHoras / item.pendentes).toFixed(1)}h`
          : `${((item.somaHoras / item.pendentes) / 24).toFixed(1)} dias`
        : '-',
    }))
    .sort((a, b) => {
      if (b.acimaSla !== a.acimaSla) return b.acimaSla - a.acimaSla;
      if (b.pendentes !== a.pendentes) return b.pendentes - a.pendentes;
      return b.maxAgingHoras - a.maxAgingHoras;
    });

  const tempoSemManutencao = computeTempoSemManutencao(concluidasRows || []);
  const atendimentoGeralResumo = computeAtendimentoGeral(concluidasRows || []);
  const inoperantesAbertosResumo = (abertasRows || [])
    .filter((item) => Boolean(item?.ponto_inoperante) && isOpenRecord(item))
    .map((item) => {
      const inicio = item?.inoperante_em || item?.data;
      return {
        id: item?.id,
        setor: item?.setor || 'N/I',
        trave: item?.trave ?? '-',
        ponto: item?.ponto || '-',
        inicioInativo: inicio,
        inicioInativoLabel: formatDateTimeBr(inicio),
        tempoInativoLabel: computeInativeDurationLabel(inicio, null, nowDate),
        motivo: item?.inoperante_motivo || item?.inoperante_observacao || item?.falha || '-',
        apontadoPor: item?.inoperante_por || item?.usuario || '-',
      };
    })
    .sort((a, b) => new Date(b.inicioInativo || 0) - new Date(a.inicioInativo || 0));

  const inoperantesConcluidosResumo = (concluidasRows || [])
    .filter((item) => Boolean(item?.ponto_inoperante) && isConcludedRecord(item))
    .map((item) => {
      const inicio = item?.inoperante_em || item?.data;
      const fim = item?.resolvido_em;
      return {
        id: item?.id,
        setor: item?.setor || 'N/I',
        trave: item?.trave ?? '-',
        ponto: item?.ponto || '-',
        inicioInativo: inicio,
        inicioInativoLabel: formatDateTimeBr(inicio),
        conclusaoInativo: fim,
        conclusaoInativoLabel: formatDateTimeBr(fim),
        tempoInativoLabel: computeInativeDurationLabel(inicio, fim, nowDate),
        finalizadoPor: item?.resolvido_por || '-',
        solucao: item?.solucao || '-',
      };
    })
    .sort((a, b) => new Date(b.conclusaoInativo || 0) - new Date(a.conclusaoInativo || 0));

  return {
    totalGeral,
    totalPendentes,
    totalConcluidas,
    chamadosInseridosNoSistema,
    conversionRate: totalGeral ? (totalConcluidas / totalGeral) * 100 : 0,
    pendentesDetalhe: (abertasRows || []).length,
    concluidasDetalhe: (concluidasRows || []).length,
    porSetor,
    porStatus,
    operationTypeDistribution,
    topCategory,
    top5,
    setorInsights,
    setorStatusResumo,
    executiveHighlight,
    pontosHistorico,
    pontosStatusResumo,
    pendingAging,
    setorAgingResumo,
    sigaChamadosAbertos,
    sigaChamadosFinalizados,
    sigaTrackingRows,
    sigaResumo,
    expectedMaintenanceDays: EXPECTED_MAINTENANCE_DAYS,
    generatedAt: nowDate.toISOString(),
    tempoSemManutencao,
    atendimentoGeralResumo,
    inoperantesAbertosResumo,
    inoperantesConcluidosResumo,
  };
}
