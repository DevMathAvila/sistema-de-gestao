import { isTraveInteiraLabel } from '../features/failures/constants/failureConstants';

export function normalizeText(texto) {
  return String(texto || '').replace(/\s|-|_/g, '').toLowerCase().trim();
}

export function parseFalhas(rawFalhas) {
  if (Array.isArray(rawFalhas)) {
    return rawFalhas.map((f) => String(f || '').trim()).filter(Boolean);
  }

  return String(rawFalhas || '')
    .split(/[,+]/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export function buildFalhasDoChamado(chamados) {
  const seen = new Set();
  const out = [];

  chamados.forEach((c) => {
    parseFalhas(c.falha).forEach((nomeFalha) => {
      const key = `${c.id}::${nomeFalha}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ id: c.id, falha: nomeFalha, key });
    });
  });

  return out;
}

export function formatarDataHora(value) {
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

export function getStatusTrave(chamados) {
  const temTraveParada = chamados.some(
    (f) => isTraveInteiraLabel(f.ponto),
  );

  let totalFalhasReais = 0;
  chamados.forEach((f) => {
    const partes = parseFalhas(f.falha);
    totalFalhasReais += partes.length || 1;
  });

  if (temTraveParada) return { label: 'TRAVE PARADA', color: 'bg-purple-600', textColor: 'text-white', level: 4 };
  if (totalFalhasReais >= 11) return { label: `URGENCIA (${totalFalhasReais})`, color: 'bg-red-600', textColor: 'text-white', level: 3 };
  if (totalFalhasReais >= 6) return { label: `PRIORIDADE (${totalFalhasReais})`, color: 'bg-orange-500', textColor: 'text-white', level: 2 };
  if (totalFalhasReais >= 1) return { label: `ATENCAO (${totalFalhasReais})`, color: 'bg-yellow-500', textColor: 'text-black', level: 1 };

  return { label: 'OPERACIONAL', color: 'bg-emerald-500', textColor: 'text-white', level: 0 };
}

export function getAlertasSininho(falhas) {
  const grupos = {};

  falhas.forEach((f) => {
    const chave = `${f.setor}-T${f.trave}`;
    if (!grupos[chave]) {
      grupos[chave] = { setor: f.setor, trave: f.trave, count: 0, isTraveToda: false };
    }

    const numFalhasNoRegistro = parseFalhas(f.falha).length || 1;
    grupos[chave].count += numFalhasNoRegistro;

    if (isTraveInteiraLabel(f.ponto)) {
      grupos[chave].isTraveToda = true;
    }
  });

  return Object.values(grupos)
    .filter((g) => g.isTraveToda || g.count >= 5)
    .sort((a, b) => {
      if (a.isTraveToda && !b.isTraveToda) return -1;
      if (!a.isTraveToda && b.isTraveToda) return 1;
      return b.count - a.count;
    });
}

export function calcularCarrinhoSetor(falhas, nomeSetor) {
  const falhasDoSetor = falhas.filter((f) => normalizeText(f.setor) === normalizeText(nomeSetor));
  const contagem = {};

  falhasDoSetor.forEach((f) => {
    parseFalhas(f.falha).forEach((p) => {
      let item = p.trim();
      if (!item) return;
      if (normalizeText(item).includes('rj45semtrava')) item = 'RJ45 Sem Trava';
      if (item.includes('Rede')) item = 'Rede';
      if (item.includes('VGA')) item = 'VGA';
      if (item.includes('Energia')) item = 'Energia Y';
      contagem[item] = (contagem[item] || 0) + 1;
    });
  });

  return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
}

export function countTravesComFalha(falhas, setor) {
  return new Set(
    falhas
      .filter((f) => normalizeText(f.setor) === normalizeText(setor))
      .map((f) => String(f.trave)),
  ).size;
}

export function temParadaCritica(falhas, setor) {
  return falhas.some(
    (f) => normalizeText(f.setor) === normalizeText(setor)
      && isTraveInteiraLabel(f.ponto),
  );
}

export function getDadosPonto(falhas, setor, trave, ponto) {
  const chamadosNoPonto = falhas.filter((f) => {
    if (normalizeText(f.setor) !== normalizeText(setor) || String(f.trave) !== String(trave)) return false;

    const pStr = String(f.ponto);
    const pNorm = normalizeText(pStr);
    const isInteira = isTraveInteiraLabel(pStr);
    const isEstePonto = new RegExp(`(^|,|\\s|ponto)${ponto}($|,|\\s)`).test(pNorm);

    return isInteira || isEstePonto;
  });

  if (chamadosNoPonto.length === 0) return null;

  const falhasDoChamado = buildFalhasDoChamado(chamadosNoPonto);
  const falhaConcatenada = falhasDoChamado.map((item) => item.falha).join(', ');

  return {
    id: chamadosNoPonto[0].id,
    ids: chamadosNoPonto.map((f) => f.id),
    setor,
    trave,
    ponto,
    falha: falhaConcatenada,
    falhasDisponiveis: falhasDoChamado,
    isMonitor: falhaConcatenada.toLowerCase().includes('monitor'),
  };
}

