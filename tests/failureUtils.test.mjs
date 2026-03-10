import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildFalhasDoChamado,
  buildTraveSupplySummary,
  countFalhasReais,
  getStatusTrave,
  splitFalhas,
  traveTemParada,
} from '../src/features/failures/services/failureUtils.js';

test('splitFalhas parses strings and arrays', () => {
  assert.deepEqual(splitFalhas('Monitor, Fonte+Rede'), ['Monitor', 'Fonte', 'Rede']);
  assert.deepEqual(splitFalhas(['Monitor', ' Fonte ']), ['Monitor', 'Fonte']);
});

test('buildFalhasDoChamado deduplicates id/failure pairs', () => {
  assert.deepEqual(
    buildFalhasDoChamado([
      { id: 10, falha: 'Monitor, Fonte' },
      { id: 10, falha: 'Fonte' },
    ]),
    [
      { id: 10, falha: 'Monitor', key: '10::Monitor' },
      { id: 10, falha: 'Fonte', key: '10::Fonte' },
    ],
  );
});

test('status helpers detect total stop and urgency', () => {
  const parada = [{ ponto: '1-15 (Inteira)', falha: 'Sem energia' }];
  assert.equal(traveTemParada(parada), true);
  assert.equal(getStatusTrave(parada).label, 'TRAVE PARADA');

  const urgentes = Array.from({ length: 6 }, (_, index) => ({
    ponto: `Ponto ${index + 1}`,
    falha: 'Monitor, Fonte',
  }));
  assert.equal(countFalhasReais(urgentes), 12);
  assert.match(getStatusTrave(urgentes).label, /URGENCIA/);
});

test('buildTraveSupplySummary aggregates materials by beam and point', () => {
  const summary = buildTraveSupplySummary([
    { ponto: 'Ponto 1', falha: 'Rede (RJ45)' },
    { ponto: 'Ponto 2', falha: 'HDMI, RJ45 Sem Trava' },
    { ponto: 'Ponto 3', falha: 'Rede (RJ45), HDMI, VGA' },
  ]);

  assert.equal(summary.totalMateriais, 6);
  assert.deepEqual(summary.porMaterial, [
    { nome: 'Cabo RJ', quantidade: 2 },
    { nome: 'HDMI', quantidade: 2 },
    { nome: 'RJ45 Sem Trava', quantidade: 1 },
    { nome: 'VGA', quantidade: 1 },
  ]);
  assert.equal(summary.porPonto.length, 3);
  assert.equal(summary.porPonto[1].ponto, 2);
});
