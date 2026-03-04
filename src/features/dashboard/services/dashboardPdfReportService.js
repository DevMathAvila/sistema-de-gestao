function safe(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

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
  return date.toLocaleString('pt-BR');
}

function renderRows(items, rowRenderer, emptyText, columns) {
  if (!items?.length) {
    return `<tr><td colspan="${columns}" class="empty">${escapeHtml(emptyText)}</td></tr>`;
  }
  return items.map(rowRenderer).join('');
}

function renderExecutiveSummary(metrics) {
  const principalSetor = metrics.porSetor?.[0];
  const principalFalha = metrics.top5?.[0];
  const criticalSetor = metrics.setorAgingResumo?.[0];

  const linhas = [
    `Total de registros analisados: ${metrics.totalGeral}.`,
    `Pendentes: ${metrics.totalPendentes}; Concluidas: ${metrics.totalConcluidas}.`,
  ];

  if (principalSetor) {
    linhas.push(`Setor com maior volume: ${principalSetor.name} (${principalSetor.total} ocorrencias).`);
  }

  if (principalFalha) {
    linhas.push(`Falha mais recorrente no periodo: ${principalFalha.nome} (${principalFalha.total} eventos).`);
  }

  if (criticalSetor) {
    linhas.push(`Gargalo de aging: ${criticalSetor.setor} com ${criticalSetor.acimaSla}/${criticalSetor.pendentes} pendencias acima do SLA.`);
  }

  if (metrics.tempoSemManutencao?.label) {
    linhas.push(`Tempo medio entre manutencoes de pontos: ${metrics.tempoSemManutencao.label}.`);
  }

  return linhas.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function buildReportHtml({ metrics, periodoLabel }) {
  const generatedAt = formatDateTime(metrics?.generatedAt || new Date());
  const expectedDays = Number(metrics?.expectedMaintenanceDays || 0);

  const setoresRows = renderRows(
    metrics.porSetor?.slice(0, 8),
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
    metrics.pendingAging?.slice(0, 15),
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
    metrics.setorAgingResumo?.slice(0, 8),
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
    metrics.setorInsights,
    (item) => `
      <tr>
        <td>${escapeHtml(item.setor)}</td>
        <td>${escapeHtml(item.topFalhas?.map((f) => `${f.falha} (${f.total})`).join(', ') || '-')}</td>
      </tr>`,
    'Sem insights por setor.',
    2
  );

  const pontosRows = renderRows(
    metrics.pontosHistorico?.slice(0, 8),
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
    metrics.pontosStatusResumo,
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
      grid-template-columns: repeat(4, minmax(100px, 1fr));
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
    .section { margin-top: 10px; }
    .foot {
      margin-top: 10px;
      color: #94a3b8;
      font-size: 9px;
      text-align: right;
    }
    @media print {
      body { margin: 8mm; }
      .hero, .box { break-inside: avoid; page-break-inside: avoid; }
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
      <div class="card"><p class="k">Pendentes</p><p class="v">${safe(metrics.totalPendentes, '0')}</p></div>
      <div class="card"><p class="k">Concluidas</p><p class="v">${safe(metrics.totalConcluidas, '0')}</p></div>
      <div class="card"><p class="k">SLA esperado</p><p class="v">${escapeHtml(`${expectedDays} dia`)}</p></div>
    </div>
  </div>

  <div class="compact-grid">
    <div class="box">
      <h2>Leitura Executiva</h2>
      <ul>${renderExecutiveSummary(metrics)}</ul>
    </div>
    <div class="box">
      <h2>Aging por Setor (Critico)</h2>
      <table>
        <thead><tr><th>#</th><th>Setor</th><th>Pend.</th><th>Acima SLA</th><th>Media</th><th>Pico</th></tr></thead>
        <tbody>${setorAgingRows}</tbody>
      </table>
    </div>
  </div>

  <div class="compact-grid section">
    <div class="box">
      <h2>Volume por Setor</h2>
      <table>
        <thead><tr><th>#</th><th>Setor</th><th>Total</th></tr></thead>
        <tbody>${setoresRows}</tbody>
      </table>
    </div>
    <div class="box">
      <h2>Top 5 Falhas</h2>
      <table>
        <thead><tr><th>#</th><th>Falha</th><th>Ocorrencias</th></tr></thead>
        <tbody>${topRows}</tbody>
      </table>
    </div>
  </div>

  <div class="box section">
    <h2>Aging de Pendencias (Mais Antigas)</h2>
    <table>
      <thead><tr><th>#</th><th>Run In</th><th>Trave</th><th>Ponto</th><th>Abertura</th><th>Tempo Aberto</th><th>SLA</th></tr></thead>
      <tbody>${agingRows}</tbody>
    </table>
  </div>

  <div class="compact-grid section">
    <div class="box">
      <h2>Falhas Dominantes por Setor</h2>
      <table>
        <thead><tr><th>Setor</th><th>Falhas</th></tr></thead>
        <tbody>${setorInsightsRows}</tbody>
      </table>
    </div>
    <div class="box">
      <h2>Pontos com Mais Historico</h2>
      <table>
        <thead><tr><th>#</th><th>Run In</th><th>Trave</th><th>Ponto</th><th>Eventos</th></tr></thead>
        <tbody>${pontosRows}</tbody>
      </table>
    </div>
  </div>

  <div class="box section">
    <h2>Status por Ponto (Pendentes x Concluidas)</h2>
    <table>
      <thead><tr><th>#</th><th>Run In</th><th>Trave</th><th>Ponto</th><th>Pendentes</th><th>Concluidas</th></tr></thead>
      <tbody>${pontoStatusRows}</tbody>
    </table>
  </div>

  <p class="foot">Relatorio gerencial gerado automaticamente.</p>
</body>
</html>`;
}

export function exportDashboardKpiReportPdf({ metrics, periodoLabel }) {
  if (!metrics) return;

  const reportWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!reportWindow) {
    window.alert('Nao foi possivel abrir a janela de exportacao. Verifique bloqueador de pop-up.');
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(buildReportHtml({ metrics, periodoLabel }));
  reportWindow.document.close();

  reportWindow.focus();
  setTimeout(() => {
    reportWindow.print();
  }, 350);
}
