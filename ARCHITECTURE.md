# ARCHITECTURE

## Finalidade deste documento

Este arquivo descreve a arquitetura atual e ativa do Lenovo Assets Systems com base no codigo real do projeto. O objetivo e permitir onboarding tecnico rapido, manutencao segura e continuidade do produto por outra pessoa ou outra IA sem depender de contexto historico oral.

Este documento evita deliberadamente descrever fluxo legado como se ainda fosse a arquitetura principal.

## Visao geral da arquitetura

O sistema e um frontend React com backend gerenciado no Supabase.

A aplicacao esta organizada em quatro blocos principais:

- `src/app`: bootstrap e roteamento
- `src/core`: infraestrutura transversal
- `src/features`: regras e interfaces por dominio
- `src/shared`: componentes e utilitarios compartilhados

O backend operacional esta no Supabase, usando:

- PostgreSQL
- Supabase Auth
- Realtime Presence
- Edge Functions
- politicas RLS

## Fluxo geral de execucao

### Entrada do app

1. `src/main.jsx` monta `React.StrictMode`
2. `ThemeProvider` e carregado
3. `BrowserRouter` envolve a aplicacao
4. `src/App.jsx` renderiza `AppRouter`
5. `src/app/router/AppRouter.jsx` decide layout, guardas de sessao e pagina final

### Fluxo de dados dominante

1. pagina chama hook da feature
2. hook chama service da feature ou `supabaseSecure`
3. `src/core/api/supabaseSecure.js` valida, sanitiza e consulta o Supabase
4. o resultado volta ao hook
5. a pagina renderiza o estado final

Esse e o fluxo mais comum do projeto inteiro.

## Mapa real da arvore principal

```text
src/
├── App.jsx
├── main.jsx
├── app/router/AppRouter.jsx
├── components/SupportMenuItem.jsx
├── core/
│   ├── api/
│   ├── auth/
│   ├── theme/
│   └── validation/
├── features/
│   ├── admin/
│   ├── ai-assistant/
│   ├── auth/
│   ├── dashboard/
│   ├── failures/
│   ├── home/
│   ├── monitoring/
│   └── news/
├── hooks/useOnlineUsers.js
└── shared/
    ├── components/
    ├── constants/
    ├── hooks/
    └── styles/
```

## Responsabilidade por camada

### `src/app`

Responsavel pela composicao macro do app.

Hoje o ponto central e:

- `src/app/router/AppRouter.jsx`

Ele concentra:

- layouts protegidos
- lazy loading de paginas
- redirecionamentos por role
- decisao entre fluxo comum e fluxo kiosk
- injecao do widget da Lei.A e do popup de novidades nos layouts corretos

### `src/core`

Infraestrutura comum a todas as features.

#### `src/core/api`

- `supabaseClient.js`: cliente base do Supabase usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- `supabaseSecure.js`: camada principal de dados do sistema

Responsabilidades de `supabaseSecure.js`:

- validacao e sanitizacao de entrada
- normalizacao de datas em timezone Brasil
- operacoes de falhas abertas e concluidas
- operacoes de pontos inoperantes
- operacoes de SIGA
- leitura e escrita de avisos
- listagem de usuarios e funcoes correlatas
- regras operacionais de restricao por role

#### `src/core/auth`

- `session.js`: sessao local em `localStorage`, leitura do usuario logado e helpers de role

Responsabilidades:

- `getSessionUser`
- `setSessionUser`
- `clearSessionData`
- `isAdminUser`
- `isMasterUser`
- `isRuninKioskUser`

#### `src/core/theme`

- `theme.jsx`: provider de tema global com alternancia entre `dark` e `black`

#### `src/core/validation`

- `validation.js`: funcoes de validacao e sanitizacao utilizadas pelo app

## `src/shared`

Camada de reuso transversal.

### `src/shared/components`

- `filters/DateRangePicker.jsx`
- `layout/AppBottomNav.jsx`

### `src/shared/constants`

Fontes de verdade compartilhadas:

- `setores.js`
- `falhasComuns.js`

`setores.js` define a lista oficial de setores operacionais do app:

- `Runin 01` a `Runin 10`
- `AVT 01` a `AVT 10`

`falhasComuns.js` define a lista padrao de insumos/falhas usadas no registro.

### `src/shared/hooks`

- `useBodyScrollLock.js`
- `usePersistentTheme.js`

### `src/shared/styles`

- `global.css`

## `src/components`

Hoje existe um componente compartilhado fora de `shared`:

- `SupportMenuItem.jsx`

Ele e usado por varias telas para renderizar a secao `Suporte` no menu, conectada ao hook de presence `useOnlineUsers`.

## `src/hooks`

Hoje existe um hook transversal fora de `shared`:

- `useOnlineUsers.js`

Responsabilidade:

- gerenciar o canal de presence `sistema_online`
- rastrear usuarios online e offline
- expor snapshot compartilhado para sidebar e menu mobile

## Features ativas

### `src/features/auth`

Responsavel por autenticacao e troca de senha.

Arquivos principais:

- `services/authService.js`
- `hooks/useLoginPage.js`
- `hooks/useChangePasswordPage.js`
- `pages/LoginPage.jsx`
- `pages/AlterarSenhaPage.jsx`

Comportamento real:

- login usa Supabase Auth
- `username` e convertido para email `@lenovo.app`
- o perfil operacional vem de `public.usuarios`
- se `force_password_change` estiver ativo, o usuario precisa trocar a senha antes de seguir
- a sessao operacional usada pela UI fica persistida localmente

### `src/features/failures`

E o dominio mais importante do sistema.

Arquivos principais:

- hooks:
  - `useRegistrarFalhaPage.js`
  - `useVisualizarFalhasPage.js`
  - `useFabricaStatusPage.js`
  - `useRuninKioskPage.js`
- services:
  - `failuresService.js`
- constants:
  - `failureConstants.js`
- pages:
  - `RegistrarFalhaPage.jsx`
  - `VisualizarFalhasPage.jsx`
  - `FabricaStatusPage.jsx`
  - `RuninKioskPage.jsx`

Responsabilidades reais:

- abertura de chamado por setor, trave e ponto
- leitura de chamados abertos por setor
- kiosk travado em setor fixo
- fechamento total ou parcial de falhas
- marcacao de ponto inoperante
- reativacao de inoperante
- envio de falhas para SIGA
- finalizacao de atendimento SIGA
- historico recente por ponto
- classificacao operacional por trave e por insumo

Detalhes estruturais importantes:

- `Runin` usa ate 23 traves e 15 pontos por trave
- `AVT` usa uma trave logica unica e 48 pontos
- o service conta falhas reais separando falhas combinadas por registro
- o mapa de visualizacao trata parada total de trave por labels como `inteira`, `1-15`, `1-48`

### `src/features/dashboard`

Responsavel pelos indicadores operacionais e exportacao de relatorios.

Arquivos principais:

- `hooks/useDashboardKpi.js`
- `hooks/useDashboardPage.js`
- `services/dashboardAnalyticsService.js`
- `services/dashboardExecutivePdfService.js`
- `services/dashboardPdfReportService.js`
- `components/DashboardKPI.jsx`
- `components/DashboardCharts.jsx`
- `components/DashboardAgingTable.jsx`
- `components/DashboardHistoricalPoints.jsx`
- `components/DashboardExecutivePdfDocument.jsx`
- `pages/DashboardPage.jsx`

Arquitetura interna:

- `useDashboardKpi` busca datasets e aplica cache em memoria
- `fetchDashboardDataset` consolida os datasets principais do periodo
- `computeDashboardMetrics` deriva as metricas consumidas pela UI e pelos PDFs
- `DashboardKPI.jsx` organiza tabs, filtros e exportacao
- `DashboardPage.jsx` e a home protegida do sistema, incluindo Lenovo News

Datasets usados no KPI:

- `kpiRows`
- `concluidasRows`
- `abertasRows`
- `abertasAtuaisRows`
- `inseridosRows`

Metricas geradas pelo analytics:

- total geral, pendentes, concluidas
- chamados inseridos no sistema
- taxa de conversao
- distribuicao por tipo operacional
- ranking de falhas
- insights por setor
- historico por ponto
- aging de pendencias
- resumo SIGA
- pontos inoperantes
- tempo medio entre manutencoes
- tempo medio de atendimento
- executive highlight

Fluxos de PDF existentes:

- executivo: `dashboardExecutivePdfService.js`
- HTML/impressao: `dashboardPdfReportService.js`

### `src/features/admin`

Responsavel por operacao administrativa.

Arquivos principais:

- `services/adminService.js`
- `hooks/useAdminPage.js`
- `hooks/useAdminCockpit.js`
- `components/AdminUsersTab.jsx`
- `components/AdminStatsTab.jsx`
- `components/AdminHistoryTab.jsx`
- `pages/AdminPage.jsx`
- `pages/AdminCockpitPage.jsx`

Responsabilidades reais:

- listar usuarios
- criar usuario por Edge Function
- remover usuario por Edge Function
- importar historico concluido via Excel
- exportar historico concluido e aberto em Excel
- gerar pareto de falhas
- consultar historico concluido e aberto por periodo
- cockpit com leitura diaria resumida

Observacao arquitetural:

- `adminService.js` usa Edge Function como primeira opcao e fallback SQL/RLS quando aplicavel
- remocao de usuario e restrita a `master`

### `src/features/home`

Responsavel pelo feed de avisos e atalhos operacionais.

Arquivos principais:

- `services/homeService.js`
- `hooks/useHomePage.js`
- `pages/HomePage.jsx`
- `pages/FaleConoscoPage.jsx`

Responsabilidades:

- carregar avisos
- publicar aviso quando o usuario e `master`
- classificar urgencia do aviso pela propria mensagem
- expor atalhos de abertura por setor

### `src/features/monitoring`

Responsavel pela tela de TV operacional.

Arquivos principais:

- `services/monitorService.js`
- `hooks/useMonitorTvPage.js`
- `pages/MonitorTvPage.jsx`

Comportamento atual:

- busca falhas abertas diretamente na tabela `registros_falhas`
- consolida alertas por setor
- destaca parada critica quando ha parada total de trave
- faz polling a cada 5 segundos

Observacao importante:

- o painel atual de monitoramento e simples e consolidado por setor
- ele nao representa um mapa fisico detalhado da planta

### `src/features/news`

Responsavel pelo historico de novidades do produto.

Arquivos principais:

- `constants/newsData.js`
- `constants/newsMeta.js`
- `hooks/useNews.js`
- `components/NewsPopup.jsx`
- `components/NewsDetailModal.jsx`
- `components/LenovoNewsLogo.jsx`
- `pages/NewsArchivePage.jsx`

Comportamento real:

- `NEWS_DATA` e cadastro manual das novidades
- `NEWS_VERSION_LATEST` define a versao viva do momento
- o popup consulta `usuarios.news_seen_version`
- o dashboard mostra apenas as 2 novidades mais recentes
- `/novidades` mostra o arquivo completo, mais novas primeiro
- `public/version.json` permite polling de versao em producao

Versao atual cadastrada:

- `1.5.0`

### `src/features/ai-assistant`

Responsavel pela Lei.A.

Arquivos principais:

- `constants/aiSystemPrompt.js`
- `hooks/useAIAssistant.js`
- `services/aiService.js`
- `services/aiTools.js`
- `components/LeiaWidget.jsx`
- `components/LeiaBubble.jsx`
- `components/LeiaChatPanel.jsx`
- `components/LeiaMessage.jsx`
- `pages/AIAssistantPage.jsx`

Fluxo real da Lei.A:

1. o usuario envia uma mensagem
2. `useAIAssistant` adiciona a mensagem ao historico
3. `aiService.generateAssistantTurn` envia a requisicao para a Edge Function `gemini-proxy`
4. o Gemini pode devolver texto ou `functionCall`
5. `useAIAssistant.executeTool` executa a tool local correspondente
6. o resultado da tool retorna como `functionResponse`
7. o Gemini gera a resposta final

Tools declaradas hoje:

- `query_registros_falhas`
- `query_pontos_inoperantes`
- `query_avisos`
- `query_dashboard_kpis`
- `query_historico_concluidas`

Características operacionais atuais:

- uso de `gemini-2.5-flash`
- prompt orientado a inferencia automatica para consultas de leitura
- leitura de briefing inicial com dados reais do dashboard
- widget flutuante e pagina dedicada
- suporte a respostas com agregacao real de falhas por tipo

## Rotas e layouts reais

`AppRouter.jsx` define quatro layouts:

- `PublicOnlyLayout`
- `AuthenticatedLayout`
- `NonKioskLayout`
- `AdminLayout`

Rotas ativas:

- `/`
- `/dashboard`
- `/home`
- `/fale-conosco`
- `/registrar`
- `/visualizar`
- `/monitor-tv`
- `/assistente`
- `/novidades`
- `/abrir-chamado`
- `/alterar-senha`
- `/admin`
- `/admin/cockpit`

Regras importantes:

- usuarios `runin_kiosk` sao redirecionados para `/abrir-chamado`
- o widget da Lei.A e o popup de novidades nao aparecem para `runin_kiosk`
- apenas `admin` e `master` entram nas rotas administrativas

## Banco de dados e backend

### Tabelas usadas diretamente pelo codigo ativo

- `public.usuarios`
- `public.registros_falhas`
- `public.avisos`
- `public.historico_concluidas`

### Campos importantes de `usuarios`

- `id`
- `username`
- `role`
- `auth_user_id`
- `force_password_change`
- `setor_fixo`
- `news_seen_version`

### Campos importantes de `registros_falhas`

- `id`
- `usuario`
- `setor`
- `trave`
- `ponto`
- `falha`
- `status`
- `data`
- `solucao`
- `resolvido_em`
- `resolvido_por`
- `ponto_inoperante`
- `inoperante_motivo`
- `inoperante_observacao`
- `inoperante_por`
- `inoperante_em`
- `siga_enviado`
- `siga_status`
- `siga_enviado_em`
- `siga_codigo_chamado`
- `siga_data_abertura`
- `siga_finalizado_em`

## Supabase Functions ativas

### `admin-users-create`

- valida o solicitante por JWT
- permite criacao por `admin` e `master`
- so `master` pode criar `admin` e `master`
- cria usuario no Auth
- insere perfil em `public.usuarios`

### `admin-users-list`

- lista usuarios para `admin` e `master`

### `admin-users-delete`

- remove usuario do Auth e do perfil operacional
- acesso restrito a `master`

### `user-clear-password-flag`

- remove a exigencia de troca de senha apos o primeiro login

### `user-mark-news-seen`

- persiste a ultima versao de novidade lida pelo usuario

### `gemini-proxy`

- valida o usuario autenticado
- encaminha a requisicao ao Gemini
- usa `GEMINI_API_KEY` como segredo do backend
- modelo atual: `gemini-2.5-flash`

## Presence e suporte

`useOnlineUsers.js` mantem um canal compartilhado de presence chamado `sistema_online`.

Ele:

- carrega usuarios da tabela `usuarios`
- acompanha presencas online em tempo real
- separa online e offline
- prioriza o usuario atual e perfis administrativos na ordenacao visivel

Esse snapshot e consumido por `SupportMenuItem.jsx`.

## Ambiente e configuracao

### Variaveis do frontend

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `PROJECT_CONTEXT_SUMMARY`

### Secrets esperados no Supabase

- `SUPABASE_URL`
- `SERVICE_ROLE_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

## Scripts e manutencao operacional

### `scripts/lint.mjs`

Nao e um lint de codigo tradicional. Hoje ele funciona como guardrail para:

- confirmar desativacao da API legada
- verificar ausencia de alguns arquivos de server antigo
- verificar trechos esperados de policy em `RLS_POLICIES.sql`

### `scripts/migrate-users-to-auth.js`

Script de migracao para sincronizar `usuarios` antigos com Supabase Auth.

## Testes atuais

Os testes ativos da pasta `tests/` cobrem:

- `computeDashboardMetrics`
- validacao e sanitizacao
- utilitarios de falhas como split, contagem e agregacao por trave

Hoje a suite e pequena e focada em logica utilitaria, nao em fluxo end-to-end.

## Observacoes arquiteturais finais

- A fonte de verdade da regra de negocio vive majoritariamente em `src/core/api/supabaseSecure.js` e nos services de feature.
- O app e fortemente orientado a hooks por tela: pagina enxuta, hook com estado e service com integracao.
- A navegacao mobile e tratada por `AppBottomNav` nas paginas principais.
- O endpoint `api/index.js` existe apenas como compatibilidade e responde `410` com mensagem de API legada desativada.
- Para novas implementacoes, o caminho preferencial continua sendo: `features` para dominio, `shared` para reuso e `core` para infraestrutura.
