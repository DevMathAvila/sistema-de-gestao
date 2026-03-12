import test from 'node:test';
import assert from 'node:assert/strict';

import { computeDashboardMetrics } from '../src/features/dashboard/services/dashboardAnalyticsService.js';

test('computeDashboardMetrics separates SIGA waiting and finalized items', () => {
  const metrics = computeDashboardMetrics(
    [
      {
        id: 1,
        setor: 'Runin 01',
        trave: 1,
        ponto: 'Ponto 1',
        falha: 'Monitor',
        status: 'aberto',
        siga_enviado: true,
        siga_status: 'AGUARDANDO',
        siga_enviado_em: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 2,
        setor: 'Runin 01',
        trave: 1,
        ponto: 'Ponto 2',
        falha: 'Rede',
        status: 'CONCLUIDO',
        siga_enviado: true,
        siga_status: 'FINALIZADO',
        siga_enviado_em: '2026-03-01T09:00:00.000Z',
        siga_finalizado_em: '2026-03-01T12:00:00.000Z',
        resolvido_em: '2026-03-01T12:00:00.000Z',
      },
    ],
    [
      {
        id: 2,
        setor: 'Runin 01',
        trave: 1,
        ponto: 'Ponto 2',
        falha: 'Rede',
        status: 'CONCLUIDO',
        siga_enviado: true,
        siga_status: 'FINALIZADO',
        siga_enviado_em: '2026-03-01T09:00:00.000Z',
        siga_finalizado_em: '2026-03-01T12:00:00.000Z',
        resolvido_em: '2026-03-01T12:00:00.000Z',
      },
    ],
    [
      {
        id: 1,
        setor: 'Runin 01',
        trave: 1,
        ponto: 'Ponto 1',
        falha: 'Monitor',
        status: 'aberto',
        siga_enviado: true,
        siga_status: 'AGUARDANDO',
        siga_enviado_em: '2026-03-01T10:00:00.000Z',
      },
    ],
    [],
    new Date('2026-03-01T13:00:00.000Z'),
  );

  assert.equal(metrics.sigaChamadosAbertos.length, 1);
  assert.equal(metrics.sigaChamadosAbertos[0].id, 1);
  assert.equal(metrics.sigaChamadosFinalizados.length, 1);
  assert.equal(metrics.sigaChamadosFinalizados[0].id, 2);
  assert.equal(metrics.sigaResumo.chamadosPendentes, 1);
  assert.equal(metrics.sigaResumo.chamadosFechados, 1);
});
