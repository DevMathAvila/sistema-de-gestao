# Sistema de Gestao de Falhas - Changelog de Refatoracao

Este README documenta, de forma tecnica, **tudo que foi refatorado** no projeto para adotar Separation of Concerns (SoC) e arquitetura limpa por dominios.

## 1. Objetivo da refatoracao

O projeto saiu de um modelo monolitico (pages gigantes com UI + estado + chamadas de API no mesmo arquivo) para um modelo em camadas:

- `core`: infraestrutura e regras transversais
- `shared`: componentes e hooks reutilizaveis
- `features`: modulos por dominio (admin, failures, dashboard, auth, home, monitoring)
- `app`: roteamento e guardas de acesso

---

## 2. Nova estrutura de pastas

```txt
src/
  app/
    router/
      AppRouter.jsx

  core/
    api/
      supabaseClient.js
      supabaseSecure.js
    auth/
      session.js
    theme/
      theme.jsx
      theme.js
    validation/
      validation.js

  shared/
    components/
      filters/
        DateRangePicker.jsx
      layout/
        AppBottomNav.jsx
    constants/
      setores.js
      falhasComuns.js
    hooks/
      usePersistentTheme.js
      useBodyScrollLock.js

  features/
    admin/
      components/
      constants/
      hooks/
      pages/
      services/
      styles/
    auth/
      hooks/
      pages/
      services/
    dashboard/
      components/
      hooks/
      pages/
    failures/
      components/
      constants/
      hooks/
      pages/
      services/
      styles/
    home/
      hooks/
      pages/
      services/
    monitoring/
      hooks/
      pages/
      services/
```

---

## 3. Mapa de migracao (arquivos movidos)

### 3.1 Core

- `src/services/supabase.js` -> `src/core/api/supabaseClient.js`
- `src/services/supabaseSecure.js` -> `src/core/api/supabaseSecure.js`
- `src/lib/session.js` -> `src/core/auth/session.js`
- `src/lib/validation.js` -> `src/core/validation/validation.js`
- `src/lib/theme.jsx` -> `src/core/theme/theme.jsx`
- `src/lib/theme.js` -> `src/core/theme/theme.js`

### 3.2 Shared

- `src/data/setores.js` -> `src/shared/constants/setores.js`
- `src/data/falhasComuns.js` -> `src/shared/constants/falhasComuns.js`
- `src/components/AppBottomNav.jsx` -> `src/shared/components/layout/AppBottomNav.jsx`
- `src/components/DateRangePicker.jsx` -> `src/shared/components/filters/DateRangePicker.jsx`

### 3.3 Features

- `src/pages/Admin.jsx` -> `src/features/admin/pages/AdminPage.jsx`
- `src/pages/AdminCockpit.jsx` -> `src/features/admin/pages/AdminCockpitPage.jsx`
- `src/pages/Dashboard.jsx` -> `src/features/dashboard/pages/DashboardPage.jsx`
- `src/components/DashboardKPI.jsx` -> `src/features/dashboard/components/DashboardKPI.jsx`
- `src/pages/FabricaStatus.jsx` -> `src/features/failures/pages/FabricaStatusPage.jsx`
- `src/pages/Registrar.jsx` -> `src/features/failures/pages/RegistrarFalhaPage.jsx`
- `src/pages/VisualizarFalhas.jsx` -> `src/features/failures/pages/VisualizarFalhasPage.jsx`
- `src/pages/Login.jsx` -> `src/features/auth/pages/LoginPage.jsx`
- `src/pages/AlterarSenha.jsx` -> `src/features/auth/pages/AlterarSenhaPage.jsx`
- `src/pages/Home.jsx` -> `src/features/home/pages/HomePage.jsx`
- `src/pages/FaleConosco.jsx` -> `src/features/home/pages/FaleConoscoPage.jsx`
- `src/components/MonitorTV.jsx` -> `src/features/monitoring/pages/MonitorTvPage.jsx`

---

## 4. Quebras de paginas grandes (refatoracao interna)

## Admin

Arquivo principal foi reduzido e dividido em modulo:

- `src/features/admin/pages/AdminPage.jsx` (composicao da tela)
- `src/features/admin/hooks/useAdminPage.js` (estado/efeitos/orquestracao)
- `src/features/admin/services/adminService.js` (API + regras + export Excel)
- `src/features/admin/styles/adminTheme.js` (tokens/estilo)
- `src/features/admin/constants/adminConfig.js` (abas, roles)
- `src/features/admin/components/AdminUsersTab.jsx`
- `src/features/admin/components/AdminStatsTab.jsx`
- `src/features/admin/components/AdminHistoryTab.jsx`
- `src/features/admin/hooks/useAdminCockpit.js`
- `src/features/admin/pages/AdminCockpitPage.jsx`

## Failures

- `src/features/failures/services/failuresService.js` (backend + regras de dominio)
- `src/features/failures/hooks/useFabricaStatusPage.js`
- `src/features/failures/hooks/useRegistrarFalhaPage.js`
- `src/features/failures/hooks/useVisualizarFalhasPage.js`
- `src/features/failures/components/FailureSectorBoard.jsx`
- `src/features/failures/components/CloseFailureModal.jsx`
- `src/features/failures/constants/failureConstants.js`
- `src/features/failures/styles/failureTheme.js`

## Dashboard

- `src/features/dashboard/hooks/useDashboardPage.js`
- `src/features/dashboard/hooks/useDashboardKpi.js`
- `src/features/dashboard/pages/DashboardPage.jsx`
- `src/features/dashboard/components/DashboardKPI.jsx`

## Auth

- `src/features/auth/services/authService.js`
- `src/features/auth/hooks/useLoginPage.js`
- `src/features/auth/hooks/useChangePasswordPage.js`
- `src/features/auth/pages/LoginPage.jsx`
- `src/features/auth/pages/AlterarSenhaPage.jsx`

## Home

- `src/features/home/services/homeService.js`
- `src/features/home/hooks/useHomePage.js`
- `src/features/home/pages/HomePage.jsx`

## Monitoring

- `src/features/monitoring/services/monitorService.js`
- `src/features/monitoring/hooks/useMonitorTvPage.js`
- `src/features/monitoring/pages/MonitorTvPage.jsx`

---

## 5. Imports: como ficaram as ligacoes

## Regra de dependencia aplicada

- `app` -> `features`, `core`
- `features/pages` -> `features/hooks`, `features/components`, `shared/components`
- `features/hooks` -> `features/services`, `core`, `shared/hooks`, `shared/constants`
- `features/services` -> `core/api`
- `shared` nao depende de `features`

## Exemplos reais de import apos refatoracao

- Router consumindo features e auth core:
  - `src/app/router/AppRouter.jsx`
- Hook de admin consumindo service + core auth:
  - `src/features/admin/hooks/useAdminPage.js`
- Service de failures consumindo apenas API core:
  - `src/features/failures/services/failuresService.js`
- Paginas de failures consumindo hook + componentes:
  - `src/features/failures/pages/VisualizarFalhasPage.jsx`
- Dashboard KPI desacoplado de API direta:
  - `src/features/dashboard/components/DashboardKPI.jsx` -> `src/features/dashboard/hooks/useDashboardKpi.js`

---

## 6. Rotas e navegacao alteradas

Arquivo central: `src/app/router/AppRouter.jsx`

Rotas ativas:

- Publica:
  - `/` -> `LoginPage`

- Protegidas:
  - `/dashboard` -> `DashboardPage`
  - `/home` -> `HomePage`
  - `/fale-conosco` -> `FaleConoscoPage`
  - `/abrir-chamado` -> `FabricaStatusPage`
  - `/registrar` -> `RegistrarFalhaPage`
  - `/visualizar` -> `VisualizarFalhasPage`
  - `/monitor-tv` -> `MonitorTvPage`
  - `/alterar-senha` -> `AlterarSenhaPage`

- Admin:
  - `/admin` -> `AdminPage`
  - `/admin/cockpit` -> `AdminCockpitPage`

- Fallback:
  - `*` -> redirect `/`

---

## 7. Novos hooks compartilhados

- `src/shared/hooks/usePersistentTheme.js`
  - centraliza persistencia de tema em `localStorage`
- `src/shared/hooks/useBodyScrollLock.js`
  - bloqueio/liberacao de scroll ao abrir menus/modais

Tambem foi ligado `ThemeProvider` no bootstrap:

- `src/main.jsx`

---

## 8. Correcoes funcionais adicionais

Foi identificado e corrigido ponto funcional quebrado:

- `HomePage` chamava `criarAviso/listarAvisos` sem implementacao em `supabaseSecure`.
- Funcoes implementadas em `src/core/api/supabaseSecure.js`.

---

## 9. Codigo removido por estar morto/nao referenciado

Arquivos removidos:

- `src/shared/components/layout/AppShell.jsx`
- `src/shared/components/layout/TopHeaderNav.jsx`
- `src/shared/components/common/GlassCard.jsx`

Motivo: nao havia referencias de import apos a nova arquitetura.

---

## 10. Status atual

- Arquitetura reorganizada por dominio/camada.
- Importacoes atualizadas para o novo layout.
- Rotas centralizadas em `app/router`.
- Paginas principais modularizadas.
- Base pronta para manutencao incremental por feature.

---

## 11. Atualizacao recente - Dashboard KPI (Aging + PDF executivo)

Foram adicionadas evolucoes no modulo `features/dashboard` para aumentar governanca operacional e visibilidade de gargalos.

### 11.1 Novas metricas de Aging (pendencias)

- Cada falha pendente agora considera:
  - data de abertura (`data`, `aberto_em` ou `created_at`)
  - tempo aberto (em horas ou dias)
  - comparacao contra SLA esperado de manutencao
- SLA padrao centralizado em:
  - `src/features/dashboard/constants/maintenance.js`
  - `EXPECTED_MAINTENANCE_DAYS = 0.1` (2.4h)
- Casos acima do SLA sao marcados como criticos.

### 11.2 Camada de servico (backend logic) expandida

- `src/features/dashboard/services/dashboardAnalyticsService.js`
  - consolidacao de dataset KPI + concluidas + abertas
  - calculo de:
    - `pendingAging`
    - `setorAgingResumo`
    - `expectedMaintenanceDays`
    - `generatedAt`
  - manteve historico de concluidas e metricas de status/setor/top falhas

### 11.3 Camada de UI (frontend) atualizada

- `src/features/dashboard/components/DashboardKPI.jsx`
  - integra novos dados de aging
  - dispara exportacao executiva de PDF
- `src/features/dashboard/components/DashboardAgingTable.jsx`
  - tabela com pendencias mais antigas
  - destaque visual para chamados criticos (acima do SLA)
- `src/features/dashboard/components/DashboardHistoricalPoints.jsx`
  - ajuste de tooltip para nao sair da tela

### 11.4 Exportacao PDF otimizada

- `src/features/dashboard/services/dashboardPdfReportService.js`
  - layout mais compacto de resumo executivo
  - prioriza primeira pagina com:
    - leitura executiva
    - aging por setor
    - top ofensores
    - pendencias mais antigas
  - mantem secoes de historico e status por ponto

### 11.5 Fluxo de dependencia (sem circularidade)

- `DashboardKPI.jsx` -> `useDashboardKpi.js` -> `dashboardAnalyticsService.js` -> `core/api/supabaseSecure.js`
- `DashboardKPI.jsx` -> `dashboardPdfReportService.js`
- `dashboardAnalyticsService.js` -> `constants/maintenance.js`
- `shared` permanece desacoplado de `features`

---

## 12. Atualizacao recente - Performance (Lighthouse) e Exportacao KPI configuravel

Foram aplicadas otimizacoes tecnicas focadas em performance de carregamento e reducao de payload sem alterar identidade visual ou regras de negocio.

### 12.1 Otimizacoes de performance aplicadas

- Lazy loading de rotas no roteador:
  - `src/app/router/AppRouter.jsx`
  - paginas carregadas com `React.lazy` + `Suspense`
- Lazy loading por tab no Admin:
  - `src/features/admin/pages/AdminPage.jsx`
  - tabs `usuarios`, `estatisticas`, `historico` e `indicadores` carregadas sob demanda
- Graficos KPI em chunk separado:
  - `src/features/dashboard/components/DashboardCharts.jsx`
  - `DashboardKPI` passou a carregar graficos com `React.lazy`
- Caching e deduplicacao de fetch KPI:
  - `src/features/dashboard/hooks/useDashboardKpi.js`
  - cache em memoria por periodo com TTL + controle de request em voo
- Exportacao Excel sob demanda:
  - `src/features/admin/services/adminService.js`
  - `xlsx` removido do bundle inicial e carregado apenas no clique de exportar
- Exportacao PDF sob demanda:
  - `src/features/dashboard/components/DashboardKPI.jsx`
  - `dashboardPdfReportService` via import dinamico no clique
- Reducao de custo de render no monitoramento:
  - `src/features/failures/hooks/useVisualizarFalhasPage.js`
  - agrupamento memoizado por setor/trave para reduzir filtros repetidos
  - `src/features/failures/services/failuresService.js` com cache/TTL de falhas abertas

### 12.2 Ajustes de bundle (icones)

Em fluxos criticos, os icones foram alterados para import por arquivo (`lucide-react/dist/esm/icons/...`) para favorecer tree-shaking/chunking:

- `src/features/admin/pages/AdminPage.jsx`
- `src/features/dashboard/components/DashboardKPI.jsx`
- `src/features/dashboard/components/DashboardHistoricalPoints.jsx`
- `src/shared/components/layout/AppBottomNav.jsx`
- `src/shared/components/filters/DateRangePicker.jsx`
- `src/features/failures/pages/VisualizarFalhasPage.jsx`
- `src/features/failures/components/CloseFailureModal.jsx`
- `src/features/failures/components/FailureSectorBoard.jsx`

### 12.3 Exportacao KPI configuravel (novo fluxo)

Ao clicar em `Exportar PDF` no dashboard KPI, agora abre modal de configuracao com secoes selecionaveis:

- `Falhas fechadas`
- `Ranking de falhas`
- `Insights por setor`
- `Aging de pendencias`
- `Pontos com mais historico de registros`

Arquivos:

- `src/features/dashboard/components/DashboardKPI.jsx`
- `src/features/dashboard/constants/reportSections.js`
- `src/features/dashboard/services/dashboardPdfReportService.js`

### 12.4 Novos presets de relatorio

- `Diario enxuto`
- `Semanal executivo` (novo)
- `Semanal completo`

No preset `Semanal executivo` foi adicionado um painel visual gerencial no PDF:

- composicao de status em formato visual tipo pizza
- torres por setor (top 5)
- torres de ranking de falhas

E foram removidas secoes redundantes nesse preset:

- tabela `Volume por Setor`
- tabela `Top 5 Falhas`

Assim, o relatorio semanal executivo fica mais objetivo para apresentacao.

## Observacao de ambiente

Durante a etapa final, o runtime local apresentou timeout em comandos `node/npm` no terminal desta sessao. A validacao final de build pode ser rodada localmente com:

```bash
npm run build
```

Se houver falha local, revisar primeiro Node/npm instalados no PATH da maquina.
