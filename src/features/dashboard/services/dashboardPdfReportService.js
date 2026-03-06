function safe(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';
const BRAZIL_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRAZIL_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function escapeHtml(value) {
  return safe(value, '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '-';
  return BRAZIL_DATE_TIME_FORMATTER.format(date);
}

function renderRows(items, rowRenderer, emptyText, columns) {
  if (!items?.length) {
    return `<tr><td colspan="${columns}" class="empty">${escapeHtml(emptyText)}</td></tr>`;
  }
  return items.map(rowRenderer).join('');
}

function normalizeSections(sections) {
  const base = {
    closedFailures: true,
    ranking: true,
    setorInsights: true,
    aging: true,
    historyPoints: true,
    sigaCalls: true,
  };

  if (!sections || typeof sections !== 'object') return base;
  return {
    closedFailures: Boolean(sections.closedFailures),
    ranking: Boolean(sections.ranking),
    setorInsights: Boolean(sections.setorInsights),
    aging: Boolean(sections.aging),
    historyPoints: Boolean(sections.historyPoints),
    sigaCalls: Boolean(sections.sigaCalls),
  };
}

function toPercent(value, total) {
  if (!total) return 0;
  const raw = (Number(value || 0) / Number(total || 1)) * 100;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, raw));
}

function renderExecutiveSummary(metrics, sections) {
  const principalSetor = metrics.porSetor?.[0];
  const principalFalha = metrics.top5?.[0];
  const criticalSetor = metrics.setorAgingResumo?.[0];

  const linhas = [
    `Chamados inseridos no sistema (periodo): ${safe(metrics?.chamadosInseridosNoSistema, '0')}.`,
    `Total de registros analisados: ${metrics.totalGeral}.`,
    `Total de falhas fechadas no periodo: ${safe(metrics.totalConcluidas, '0')}.`,
    `Pendentes: ${metrics.totalPendentes}; Concluidas: ${metrics.totalConcluidas}.`,
  ];

  if (principalSetor) {
    linhas.push(`Setor com maior volume: ${principalSetor.name} (${principalSetor.total} ocorrencias).`);
  }

  if (sections.ranking && principalFalha) {
    linhas.push(`Falha mais recorrente no periodo: ${principalFalha.nome} (${principalFalha.total} eventos).`);
  }

  if (sections.aging && criticalSetor) {
    linhas.push(`Gargalo de aging: ${criticalSetor.setor} com ${criticalSetor.acimaSla}/${criticalSetor.pendentes} pendencias acima do SLA.`);
  }

  if (metrics.tempoSemManutencao?.label) {
    linhas.push(`Tempo medio entre manutencoes de pontos: ${metrics.tempoSemManutencao.label}.`);
  }
  if (metrics?.atendimentoGeralResumo?.mediaLabel && metrics.atendimentoGeralResumo.mediaLabel !== '-') {
    linhas.push(`Tempo medio de atendimento (abertura ao fechamento): ${metrics.atendimentoGeralResumo.mediaLabel}.`);
  }
  if (sections.sigaCalls && Array.isArray(metrics.sigaChamadosAbertos) && metrics.sigaChamadosAbertos.length > 0) {
    linhas.push(`Chamados SIGA aguardando: ${metrics.sigaChamadosAbertos.length}.`);
  }
  if (sections.sigaCalls && metrics?.sigaResumo?.atendimentoTotalLabel && metrics.sigaResumo.atendimentoTotalLabel !== '-') {
    linhas.push(`Tempo de atendimento SIGA no periodo: ${metrics.sigaResumo.atendimentoTotalLabel}.`);
  }

  return linhas.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function buildReportHtml({ metrics, periodoLabel, sections, preset }) {
  const selectedSections = normalizeSections(sections);
  const generatedAt = formatDateTime(metrics?.generatedAt || new Date());
  const expectedDays = Number(metrics?.expectedMaintenanceDays || 0);
  const isWeeklyExecutive = preset === 'weeklyExecutive';
  const chamadosInseridos = Number(metrics?.chamadosInseridosNoSistema || 0);

  const setoresRows = renderRows(
    metrics.porSetor?.slice(0, 6),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${safe(item.total, '0')}</td>
      </tr>`,
    'Sem dados de setor no periodo.',
    3
  );

  const topRows = renderRows(
    metrics.top5,
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.nome)}</td>
        <td>${safe(item.total, '0')}</td>
      </tr>`,
    'Sem dados de recorrencia.',
    3
  );

  const agingRows = renderRows(
    metrics.pendingAging?.slice(0, 8),
    (item, idx) => `
      <tr class="${item.aboveSla ? 'critical' : ''}">
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${escapeHtml(item.openedLabel)}</td>
        <td>${escapeHtml(item.agingLabel)}</td>
        <td>${item.aboveSla ? 'Critico' : 'Dentro'}</td>
      </tr>`,
    'Sem pendencias no periodo.',
    7
  );

  const setorAgingRows = renderRows(
    metrics.setorAgingResumo?.slice(0, 6),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${safe(item.pendentes, '0')}</td>
        <td>${safe(item.acimaSla, '0')}</td>
        <td>${escapeHtml(item.mediaLabel)}</td>
        <td>${escapeHtml(item.maxAgingLabel)}</td>
      </tr>`,
    'Sem consolidacao de aging por setor.',
    6
  );

  const setorInsightsRows = renderRows(
    metrics.setorInsights?.slice(0, 6),
    (item) => `
      <tr>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.topFalhas?.map((f) => `${f.falha} (${f.total})`).join(', ') || '-')}</td>
      </tr>`,
    'Sem insights por setor.',
    2
  );

  const pontosRows = renderRows(
    metrics.pontosHistorico?.slice(0, 6),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${safe(item.totalEventos, '0')}</td>
      </tr>`,
    'Sem historico de trocas no periodo.',
    5
  );

  const pontoStatusRows = renderRows(
    metrics.pontosStatusResumo?.slice(0, 8),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${safe(item.pendentes, '0')}</td>
        <td>${safe(item.concluidas, '0')}</td>
      </tr>`,
    'Sem consolidacao de status por ponto.',
    6
  );

  const inoperantesAbertosRows = renderRows(
    metrics.inoperantesAbertosResumo?.slice(0, 12),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${escapeHtml(item.inicioInativoLabel)}</td>
        <td>${escapeHtml(item.tempoInativoLabel)}</td>
        <td>${escapeHtml(item.motivo)}</td>
        <td>${escapeHtml(item.apontadoPor)}</td>
      </tr>`,
    'Sem pontos inoperantes em aberto no periodo.',
    8
  );

  const inoperantesConcluidosRows = renderRows(
    metrics.inoperantesConcluidosResumo?.slice(0, 12),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${escapeHtml(item.inicioInativoLabel)}</td>
        <td>${escapeHtml(item.conclusaoInativoLabel)}</td>
        <td>${escapeHtml(item.finalizadoPor)}</td>
        <td>${escapeHtml(item.solucao)}</td>
      </tr>`,
    'Sem pontos inoperantes concluidos no periodo.',
    8
  );

  const sigaRows = renderRows(
    metrics.sigaChamadosAbertos?.slice(0, 10),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${escapeHtml(item.falha)}</td>
        <td>${escapeHtml(item.enviadoEmLabel)}</td>
        <td>${escapeHtml(item.codigoChamado)}</td>
      </tr>`,
    'Sem chamados enviados para SIGA no periodo.',
    7
  );

  const sigaFinalizadosRows = renderRows(
    metrics.sigaChamadosFinalizados?.slice(0, 10),
    (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.trave)}</td>
        <td>${escapeHtml(item.ponto)}</td>
        <td>${escapeHtml(item.codigoChamado)}</td>
        <td>${escapeHtml(item.fechadoEmLabel)}</td>
        <td>${escapeHtml(item.atendimentoLabel)}</td>
      </tr>`,
    'Sem chamados SIGA finalizados no periodo.',
    7
  );
  const sigaPendentes = Number(metrics?.sigaResumo?.chamadosPendentes || 0);
  const sigaFechados = Number(metrics?.sigaResumo?.chamadosFechados || 0);
  const sigaTotal = Math.max(sigaPendentes + sigaFechados, 1);
  const sigaPendentesPct = toPercent(sigaPendentes, sigaTotal);
  const sigaPieStyle = `conic-gradient(#dc2626 0 ${sigaPendentesPct}%, #16a34a ${sigaPendentesPct}% 100%)`;

  const rankingSection = selectedSections.ranking
    ? `
      <div class="box">
        <h2>Top 5 Falhas</h2>
        <table>
          <thead><tr><th>#</th><th>Falha</th><th>Ocorrencias</th></tr></thead>
          <tbody>${topRows}</tbody>
        </table>
      </div>`
    : '';

  const agingSection = selectedSections.aging
    ? `
      <div class="box">
        <h2>Aging por Setor (Critico)</h2>
        <table>
          <thead><tr><th>#</th><th>Setor</th><th>Pend.</th><th>Acima SLA</th><th>Media</th><th>Pico</th></tr></thead>
          <tbody>${setorAgingRows}</tbody>
        </table>
      </div>
      <div class="box section">
        <h2>Aging de Pendencias (Mais Antigas)</h2>
        <table>
          <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Abertura</th><th>Tempo Aberto</th><th>SLA</th></tr></thead>
          <tbody>${agingRows}</tbody>
        </table>
      </div>`
    : '';

  const insightsSection = selectedSections.setorInsights
    ? `
      <div class="box section">
        <h2>Falhas Dominantes por Setor</h2>
        <table>
          <thead><tr><th>Setor</th><th>Falhas</th></tr></thead>
          <tbody>${setorInsightsRows}</tbody>
        </table>
      </div>`
    : '';

  const historySection = selectedSections.historyPoints
    ? `
      <div class="box section">
        <h2>Pontos com Mais Historico</h2>
        <table>
          <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Eventos</th></tr></thead>
          <tbody>${pontosRows}</tbody>
        </table>
      </div>`
    : '';

  const sigaSection = selectedSections.sigaCalls
    ? `
      <div class="box section">
        <h2>KPI SIGA</h2>
        <div class="visual-grid siga-grid">
          <div class="visual-card">
            <p class="visual-title">Status dos Chamados SIGA</p>
            <div class="pie-wrap">
              <div class="pie-chart" style="background:${sigaPieStyle}"></div>
              <div class="pie-meta">
                <p><span class="dot dot-pending"></span>Chamados abertos totais: ${safe(metrics?.sigaResumo?.chamadosAbertosTotais, '0')}</p>
                <p><span class="dot dot-pending"></span>Chamados pendentes: ${safe(metrics?.sigaResumo?.chamadosPendentes, '0')}</p>
                <p><span class="dot dot-concluded"></span>Chamados fechados: ${safe(metrics?.sigaResumo?.chamadosFechados, '0')}</p>
              </div>
            </div>
          </div>
          <div class="visual-card">
            <p class="visual-title">Tempo de Atendimento Geral</p>
            <p class="kpi-main">${escapeHtml(safe(metrics?.sigaResumo?.atendimentoTotalLabel, '-'))}</p>
            <p class="kpi-sub">Media por chamado: ${escapeHtml(safe(metrics?.sigaResumo?.atendimentoMedioLabel, '-'))}</p>
            <p class="kpi-sub">Pico no periodo: ${escapeHtml(safe(metrics?.sigaResumo?.atendimentoMaxLabel, '-'))}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Falha</th><th>Enviado</th><th>Codigo</th></tr></thead>
          <tbody>${sigaRows}</tbody>
        </table>
        <table class="section">
          <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Codigo</th><th>Finalizado</th><th>Atendimento</th></tr></thead>
          <tbody>${sigaFinalizadosRows}</tbody>
        </table>
      </div>`
    : '';

  const statusTotal = Number(metrics.totalPendentes || 0) + Number(metrics.totalConcluidas || 0);
  const pendingPct = toPercent(metrics.totalPendentes, statusTotal);
  const concludedPct = toPercent(metrics.totalConcluidas, statusTotal);
  const pieStyle = `conic-gradient(#cf102d 0 ${pendingPct}%, #16a34a ${pendingPct}% 100%)`;

  const setorTowerRows = (metrics.porSetor || [])
    .slice(0, 5)
    .map((item) => {
      const pct = toPercent(item.total, metrics.porSetor?.[0]?.total || 1);
      return `
        <div class="tower-row">
          <div class="tower-label">${escapeHtml(item.name)}</div>
          <div class="tower-track"><div class="tower-fill" style="width:${pct}%"></div></div>
          <div class="tower-value">${safe(item.total, '0')}</div>
        </div>`;
    })
    .join('');

  const falhaTowerRows = (metrics.top5 || [])
    .slice(0, 5)
    .map((item) => {
      const pct = toPercent(item.total, metrics.top5?.[0]?.total || 1);
      return `
        <div class="tower-row">
          <div class="tower-label">${escapeHtml(item.nome)}</div>
          <div class="tower-track"><div class="tower-fill tower-fill-alt" style="width:${pct}%"></div></div>
          <div class="tower-value">${safe(item.total, '0')}</div>
        </div>`;
    })
    .join('');

  const executiveVisualSection = isWeeklyExecutive
    ? `
      <div class="box section">
        <h2>Painel Visual Executivo</h2>
        <div class="visual-grid">
          <div class="visual-card">
            <p class="visual-title">Composicao de Status</p>
            <div class="pie-wrap">
              <div class="pie-chart" style="background:${pieStyle}"></div>
              <div class="pie-meta">
                <p><span class="dot dot-pending"></span>Pendentes: ${safe(metrics.totalPendentes, '0')} (${pendingPct.toFixed(1)}%)</p>
                <p><span class="dot dot-concluded"></span>Concluidas: ${safe(metrics.totalConcluidas, '0')} (${concludedPct.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
          <div class="visual-card">
            <p class="visual-title">Torres por Setor (Top 5)</p>
            ${setorTowerRows || '<p class="empty">Sem dados.</p>'}
          </div>
          <div class="visual-card visual-card-full">
            <p class="visual-title">Torres de Ranking de Falhas</p>
            ${falhaTowerRows || '<p class="empty">Sem dados.</p>'}
          </div>
        </div>
      </div>`
    : '';

  const volumeSection = !isWeeklyExecutive
    ? `
    <div class="box">
      <h2>Volume por Setor</h2>
      <table>
        <thead><tr><th>#</th><th>Setor</th><th>Total</th></tr></thead>
        <tbody>${setoresRows}</tbody>
      </table>
    </div>`
    : '';

  return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatorio KPI - Lenovo</title>
  <style>
    :root {
      --red: #cf102d;
      --dark: #121212;
      --gray: #64748b;
      --line: #e5e7eb;
      --card: #f8fafc;
      --critical-bg: #fff1f2;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: var(--dark);
      margin: 16px;
      line-height: 1.3;
      background: #fff;
      font-size: 11px;
    }
    .hero {
      border: 1px solid #f0d0d6;
      border-radius: 14px;
      padding: 14px;
      background: linear-gradient(120deg, #fff5f7, #ffffff 60%);
      margin-bottom: 10px;
    }
    .brand {
      font-size: 10px;
      letter-spacing: .16em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--red);
      margin: 0;
    }
    h1 {
      margin: 6px 0 2px;
      font-size: 24px;
      font-style: italic;
      text-transform: uppercase;
    }
    .sub {
      color: var(--gray);
      margin: 0;
      font-size: 11px;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(5, minmax(100px, 1fr));
      gap: 8px;
      margin-top: 10px;
    }
    .meta .card {
      border: 1px solid #f1f5f9;
      border-left: 4px solid var(--red);
      border-radius: 10px;
      padding: 8px 10px;
      background: #fff;
    }
    .meta .k { margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--gray); font-weight: 700; }
    .meta .v { margin: 2px 0 0; font-size: 16px; font-weight: 800; color: var(--red); }
    .compact-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 10px;
      margin-top: 10px;
      align-items: start;
    }
    .box {
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
      break-inside: avoid;
    }
    .box h2 {
      margin: 0;
      padding: 8px 10px;
      background: var(--card);
      color: #0f172a;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .07em;
    }
    .box ul { margin: 8px 12px; padding-left: 16px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    th, td {
      border-top: 1px solid var(--line);
      padding: 6px 7px;
      text-align: left;
      vertical-align: top;
    }
    th {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: #334155;
      background: #fff;
    }
    .empty { text-align: center; color: var(--gray); font-style: italic; }
    .critical td { background: var(--critical-bg); color: #9f1239; font-weight: 700; }
    .tower-row { display: grid; grid-template-columns: 90px 1fr 42px; gap: 6px; align-items: center; margin-bottom: 6px; }
    .tower-label { font-size: 9px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tower-track { height: 9px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
    .tower-fill { background: linear-gradient(90deg, #cf102d, #f43f5e); height: 100%; border-radius: 999px; }
    .tower-fill-alt { background: linear-gradient(90deg, #ef4444, #fb923c); }
    .tower-value { font-size: 9px; text-align: right; font-weight: 700; color: #0f172a; }
    .visual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }
    .siga-grid { padding-bottom: 0; }
    .visual-card { border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
    .visual-card-full { grid-column: 1 / -1; }
    .visual-title { margin: 0 0 8px; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #475569; font-weight: 700; }
    .pie-wrap { display: flex; align-items: center; gap: 10px; }
    .pie-chart { width: 82px; height: 82px; border-radius: 999px; border: 1px solid #e2e8f0; }
    .pie-meta p { margin: 0 0 4px; font-size: 10px; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 6px; }
    .dot-pending { background: #cf102d; }
    .dot-concluded { background: #16a34a; }
    .kpi-main { margin: 2px 0 8px; color: var(--red); font-size: 22px; font-weight: 800; }
    .kpi-sub { margin: 0 0 5px; font-size: 10px; color: #475569; }
    .section { margin-top: 10px; }
    .section-note {
      margin: 8px 10px 0;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: #64748b;
      font-weight: 700;
    }
    .foot {
      margin-top: 10px;
      color: #94a3b8;
      font-size: 9px;
      text-align: right;
    }
    @media print {
      body { margin: 7mm; }
      .hero, .box { break-inside: avoid; page-break-inside: avoid; }
      table { font-size: 9px; }
      th, td { padding: 5px 6px; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <p class="brand">Lenovo KPI Report</p>
    <h1>Resumo Executivo</h1>
    <p class="sub">Periodo analisado: ${escapeHtml(periodoLabel)}</p>
    <p class="sub">Gerado em: ${escapeHtml(generatedAt)}</p>

    <div class="meta">
      <div class="card"><p class="k">Total de Falhas</p><p class="v">${safe(metrics.totalGeral, '0')}</p></div>
      <div class="card"><p class="k">Chamados inseridos no sistema</p><p class="v">${safe(chamadosInseridos, '0')}</p></div>
      <div class="card"><p class="k">Pendentes</p><p class="v">${safe(metrics.totalPendentes, '0')}</p></div>
      <div class="card"><p class="k">Concluidas</p><p class="v">${safe(metrics.totalConcluidas, '0')}</p></div>
      <div class="card"><p class="k">Media atendimento</p><p class="v">${escapeHtml(safe(metrics?.atendimentoGeralResumo?.mediaLabel, '-'))}</p></div>
      <div class="card"><p class="k">SLA esperado</p><p class="v">${escapeHtml(`${expectedDays} dia`)}</p></div>
    </div>
  </div>

  <div class="compact-grid">
    <div class="box">
      <h2>Leitura Executiva</h2>
      <p class="section-note">Chamados inseridos no sistema: ${safe(chamadosInseridos, '0')}</p>
      <ul>${renderExecutiveSummary(metrics, selectedSections)}</ul>
    </div>
    ${volumeSection}
  </div>

  ${executiveVisualSection}

  ${!isWeeklyExecutive && rankingSection ? `<div class="section">${rankingSection}</div>` : ''}

  ${agingSection}

  ${insightsSection}

  ${historySection}

  ${sigaSection}

  <div class="box section">
    <h2>Pontos Inoperantes</h2>
    <table>
      <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Inicio Inativo</th><th>Tempo Inativo</th><th>Motivo</th><th>Apontado por</th></tr></thead>
      <tbody>${inoperantesAbertosRows}</tbody>
    </table>
    <table class="section">
      <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Inicio Inativo</th><th>Conclusao</th><th>Finalizado por</th><th>O que foi feito</th></tr></thead>
      <tbody>${inoperantesConcluidosRows}</tbody>
    </table>
  </div>

  <div class="box section">
    <h2>Status por Ponto (Pendentes x Concluidas)</h2>
    <p class="section-note">Chamados inseridos no sistema: ${safe(chamadosInseridos, '0')}</p>
    <table>
      <thead><tr><th>#</th><th>Setor</th><th>Trave</th><th>Ponto</th><th>Pendentes</th><th>Concluidas</th></tr></thead>
      <tbody>${pontoStatusRows}</tbody>
    </table>
  </div>

  <p class="foot">Relatorio gerencial gerado automaticamente.</p>
</body>
</html>`;
}

export function exportDashboardKpiReportPdf({ metrics, periodoLabel, sections, preset }) {
  if (!metrics) return;

  const reportWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!reportWindow) {
    window.alert('Nao foi possivel abrir a janela de exportacao. Verifique bloqueador de pop-up.');
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(buildReportHtml({ metrics, periodoLabel, sections, preset }));
  reportWindow.document.close();

  reportWindow.focus();
  setTimeout(() => {
    reportWindow.print();
  }, 350);
}
