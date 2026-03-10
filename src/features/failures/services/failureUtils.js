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

const INSUMO_RULES = [
  { match: ['rede', 'rj45', 'cabo rj'], nome: 'Cabo RJ' },
  { match: ['hdmi'], nome: 'HDMI' },
  { match: ['vga'], nome: 'VGA' },
  { match: ['displayport', 'display port', 'dp'], nome: 'DisplayPort' },
  { match: ['acadapter', 'ac adapter', 'fonte'], nome: 'AC Adapter' },
  { match: ['energiay', 'energia y'], nome: 'Energia Y' },
  { match: ['pinoretangular', 'pino retangular'], nome: 'Pino Retangular' },
  { match: ['monitor'], nome: 'Monitor' },
];

function getPointTargets(pointRaw) {
  const raw = String(pointRaw || '').trim();
  const normalized = normalizeText(raw);
  if (!raw) return [];
  if (normalized.includes('travetoda') || normalized.includes('inteira') || raw.includes('1-15') || raw.includes('1-40')) {
    return ['Todos'];
  }

  const matches = [...raw.matchAll(/ponto\s*(\d+)/gi)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isInteger(value));

  if (matches.length) return [...new Set(matches)].sort((a, b) => a - b);

  const fallback = raw.match(/(\d+)/);
  if (fallback) return [Number(fallback[1])];
  return [];
}

export function getInsumosFromFalha(falha) {
  const normalized = normalizeText(falha);
  return INSUMO_RULES
    .filter((rule) => rule.match.some((token) => normalized.includes(normalizeText(token))))
    .map((rule) => rule.nome);
}

export function buildTraveSupplySummary(chamados) {
  const materialMap = new Map();
  const pointMap = new Map();

  chamados.forEach((chamado) => {
    const pontos = getPointTargets(chamado?.ponto);
    const materiais = splitFalhas(chamado?.falha)
      .flatMap((falha) => getInsumosFromFalha(falha))
      .filter(Boolean);

    materiais.forEach((nome) => {
      materialMap.set(nome, (materialMap.get(nome) || 0) + 1);
    });

    if (!pontos.length || !materiais.length) return;

    pontos.forEach((ponto) => {
      const pointKey = String(ponto);
      const current = pointMap.get(pointKey) || { ponto, materiais: new Map() };
      materiais.forEach((nome) => {
        current.materiais.set(nome, (current.materiais.get(nome) || 0) + 1);
      });
      pointMap.set(pointKey, current);
    });
  });

  const porMaterial = [...materialMap.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => {
      if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
      return a.nome.localeCompare(b.nome);
    });

  const porPonto = [...pointMap.values()]
    .map((item) => ({
      ponto: item.ponto,
      totalItens: [...item.materiais.values()].reduce((acc, value) => acc + value, 0),
      materiais: [...item.materiais.entries()]
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => {
          if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
          return a.nome.localeCompare(b.nome);
        }),
    }))
    .sort((a, b) => {
      if (a.ponto === 'Todos') return -1;
      if (b.ponto === 'Todos') return 1;
      return Number(a.ponto) - Number(b.ponto);
    });

  return {
    totalMateriais: porMaterial.reduce((acc, item) => acc + item.quantidade, 0),
    totalCategorias: porMaterial.length,
    totalPontos: porPonto.filter((item) => item.ponto !== 'Todos').length,
    porMaterial,
    porPonto,
  };
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
