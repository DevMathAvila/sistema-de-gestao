# ARCHITECTURE

## Objetivo

Este documento serve como base de conhecimento do projeto para outras IAs e para onboarding tecnico. O foco principal e descrever apenas a arquitetura funcional atual, separando explicitamente o que parece legado, duplicado ou fora da arvore principal de execucao.

## Resumo Executivo

- Projeto frontend em `React 18 + Vite 5`, escrito em `JavaScript/JSX`, sem TypeScript.
- A arquitetura atual esta organizada majoritariamente por dominio em `src/features`, com infraestrutura em `src/core` e compartilhados em `src/shared`.
- O app usa `Supabase` como backend principal: `Auth`, tabelas em `public`, `RLS` e `Edge Functions`.
- O frontend faz a maior parte das leituras e escritas diretamente via `src/core/api/supabaseSecure.js`.
- Existe uma camada antiga/duplicada em `src/components`, `src/hooks`, `src/services`, `src/utils`, `server/` e `api/`, mas ela nao faz parte do fluxo principal do app renderizado hoje.

## Higienizacao de Contexto

### Itens que parecem ativos e devem guiar novas IAs

- `src/main.jsx`
- `src/App.jsx`
- `src/app/router/`
- `src/core/`
- `src/features/`
- `src/shared/`
- `supabase/`
- `docs/SEGURANCA.md` apenas como referencia historica, com ressalvas de desatualizacao

### Candidatos fortes a legado, duplicacao ou uso residual

Arquivos abaixo nao entram no fluxo principal do bundle frontend atual, ou existem como versoes anteriores de modulos hoje reescritos:

- `src/components/admin/AdminHistorySection.jsx`
- `src/components/admin/AdminStatsSection.jsx`
- `src/components/admin/AdminUsersSection.jsx`
- `src/components/alterar-senha/PasswordStrengthBar.jsx`
- `src/components/layout/AppMobileHeader.jsx`
- `src/components/layout/AppMobileMenu.jsx`
- `src/components/layout/AppSidebar.jsx`
- `src/components/login/LoginFormCard.jsx`
- `src/components/registrar/FalhasSelector.jsx`
- `src/components/registrar/PontosSelector.jsx`
- `src/components/registrar/TraveSelector.jsx`
- `src/components/visualizar-falhas/AlertsPanel.jsx`
- `src/components/visualizar-falhas/FalhaResolutionModal.jsx`
- `src/components/visualizar-falhas/SetorFalhasList.jsx`
- `src/hooks/forms/useLoginForm.js`
- `src/hooks/forms/usePasswordUpdate.js`
- `src/hooks/forms/useRegistrarForm.js`
- `src/hooks/services/useAdminApi.js`
- `src/hooks/services/useFalhasApi.js`
- `src/hooks/useFabricaStatusData.js`
- `src/hooks/useThemeMode.jsx`
- `src/hooks/useUiChrome.js`
- `src/services/api/failuresService.js`
- `src/services/http/apiClient.js`
- `src/utils/session.js`
- `src/utils/uiClasses.js`
- `src/utils/validation.js`
- `src/utils/visualizarFalhasUtils.js`
- `src/core/theme/theme.js` como reexport residual; o app usa `theme.jsx`
- `server/api/handler.js`
- `server/services/supabaseSecureService.js`
- `server/config/supabaseClient.js`
- `server/constants/`
- `api/index.js` como camada de compatibilidade Vercel; nao e consumida pelo frontend atual

### Arquivos de teste e referencia que apontam para modulos nao usados pela aplicacao

- `tests/dashboardMetrics.test.mjs` testa `src/features/dashboard/services/dashboardMetrics.js`, mas o app atual usa `dashboardAnalyticsService.js`
- `tests/failureUtils.test.mjs` testa `src/features/failures/services/failureUtils.js`, mas o app atual usa `failuresService.js`
- `src/features/dashboard/services/dashboardMetrics.js` parece modulo antigo, hoje substituido por `src/features/dashboard/services/dashboardAnalyticsService.js`
- `src/features/failures/services/failureUtils.js` parece modulo antigo, hoje substituido por funcoes consolidadas em `src/features/failures/services/failuresService.js`
- `docs/SEGURANCA.md` menciona caminhos antigos como `src/lib/validation.js` e `src/services/supabaseSecure.js`
- `scripts/lint.mjs` espera que parte da API legada ja tenha sido removida, mas esses arquivos ainda existem

### Observacoes de confiabilidade

- Para gerar novos arquivos, usar como fonte de verdade a estrutura `src/app + src/core + src/features + src/shared`.
- Nao usar `src/components`, `src/hooks`, `src/services`, `src/utils` ou `server/` como padrao para novas implementacoes, a menos que a tarefa seja explicitamente uma migracao legada.

## Mapa da Estrutura Atual

### Raiz

- `src/`: frontend principal e arvore funcional do app
- `supabase/`: SQL canonico, migracoes, politicas RLS e Edge Functions
- `tests/`: testes unitarios pontuais; atualmente parcialmente desatualizados
- `scripts/`: scripts de validacao/guardrails e migracao auxiliar
- `docs/`: documentacao de apoio
- `api/`: endpoint Vercel legado/compatibilidade
- `server/`: camada server-side antiga/duplicada, nao usada pelo frontend atual
- `dist/`: artefatos gerados de build

## Responsabilidade por Diretorio

### `src/app/`

- Contem a organizacao de alto nivel da aplicacao.
- Hoje a responsabilidade central esta em `src/app/router/AppRouter.jsx`.
- Se uma nova pagina precisar de rota, este e o ponto de integracao principal.

### `src/core/`

- Infraestrutura transversal do app.
- `api/`: cliente Supabase e camada segura de acesso a dados.
- `auth/`: persistencia de sessao local, helpers de papel/permissao e leitura do usuario logado.
- `theme/`: provider global de tema e hook de contexto.
- `validation/`: sanitizacao e validacoes base reutilizadas por servicos.

### `src/features/`

- Camada principal de dominio.
- Cada subdiretorio concentra pagina, hook, servicos, constantes, componentes e estilos da propria feature.
- Esse e o lugar preferencial para criar novas regras de negocio, hooks de tela e componentes especificos de um dominio.

Subdominios atuais:

- `admin/`: gestao de usuarios, pareto, historico, importacao/exportacao e cockpit admin
- `auth/`: login, troca de senha e logout
- `dashboard/`: KPI, agregacoes, filtros, PDF executivo/completo e analiticos
- `failures/`: registro, visualizacao, conclusao, inoperantes, SIGA e kiosk
- `home/`: avisos, pagina inicial e contato
- `monitoring/`: painel TV operacional

### `src/shared/`

- Recursos reutilizaveis entre features.
- `components/`: componentes cross-feature, como navegacao mobile e filtros de data.
- `constants/`: listas mestre como setores e falhas comuns.
- `hooks/`: hooks simples e genericos reutilizados em varias features.
- `styles/`: CSS global.

### `supabase/`

- Fonte de verdade do backend gerenciado.
- `DB_CANONICAL_SETUP.sql`: setup principal esperado do banco.
- `MIGRATION_AUTH.sql`: migracao relacionada a Auth.
- `RLS_POLICIES.sql`: politicas de seguranca e regras de acesso.
- `functions/`: Edge Functions administrativas e de suporte.

### `scripts/`

- Guardrails e utilitarios operacionais.
- `lint.mjs` hoje funciona mais como auditor de migracao/seguranca do que como lint tradicional.
- `migrate-users-to-auth.js` apoia migracao de usuarios para Supabase Auth.

### `tests/`

- Testes unitarios em `node:test`.
- Hoje a pasta mistura cobertura valida com cobertura sobre modulos antigos.
- Antes de expandir a suite, vale alinhar os testes aos modulos ativos em `dashboardAnalyticsService.js` e `failuresService.js`.

## Entradas e Fluxos Principais

### Frontend

- Entrada do app: `src/main.jsx`
- Shell raiz: `src/App.jsx`
- Roteamento principal: `src/app/router/AppRouter.jsx`

### Rotas ativas

- `/`: login
- `/dashboard`: dashboard principal
- `/home`: pagina inicial de avisos
- `/fale-conosco`: contato
- `/registrar`: registro manual de falhas
- `/visualizar`: monitor e mesa de trabalho de falhas
- `/monitor-tv`: painel operacional em modo monitor
- `/abrir-chamado`: entrada autenticada; kiosk cai aqui
- `/alterar-senha`: troca de senha
- `/admin`: painel administrativo
- `/admin/cockpit`: cockpit admin

### Regras de acesso

- O roteador diferencia:
- `PublicOnlyLayout`
- `AuthenticatedLayout`
- `NonKioskLayout`
- `AdminLayout`

- `runin_kiosk` e redirecionado para `/abrir-chamado`
- `admin` e `master` recebem acesso administrativo
- `colaborador` e `runin_kiosk` possuem restricoes de manutencao/escrita em partes do fluxo

## Stack Principal

### Runtime e UI

- `React 18`
- `React Router DOM 6`
- `Vite 5`
- `Tailwind CSS 3`
- `lucide-react`

### Dados, backend e seguranca

- `@supabase/supabase-js`
- `Supabase Auth`
- `Supabase Database`
- `Supabase Edge Functions`
- `RLS` via SQL em `supabase/RLS_POLICIES.sql`

### Relatorios e exportacao

- `recharts`
- `jspdf`
- `html-to-image`
- `xlsx`

## Convencoes e Padroes de Escrita

### Organizacao

- Estrutura por dominio em `src/features/<feature>`
- Infra compartilhada em `src/core`
- Reuso cross-feature em `src/shared`

### Componentes e hooks

- Componentes React em `function ComponentName() {}` ou `export default function ComponentName() {}`
- Hooks customizados com prefixo `use`
- Hooks de tela concentram estado, side effects, navegacao e integracao com servicos
- Paginas tendem a ficar mais declarativas e consumir um unico hook-viewmodel

### Exports

- `default export` para paginas e muitos componentes React
- `named exports` para hooks, helpers e servicos

### Estilo de codigo

- ES Modules com imports relativos
- Nomes de dominio em portugues
- Convenções de nomeacao:
- `Page` para paginas
- `Service` para integracoes/logica de negocio
- `Tab`, `Board`, `Modal`, `Section` para componentes de interface
- `useXPage` ou `useX` para hooks

### Estado e dados

- `useState`, `useEffect`, `useMemo`, `useCallback`
- `React.lazy` + `Suspense` para code splitting de paginas e blocos pesados
- Cache manual simples em memoria/localStorage em alguns hooks e servicos
- Tema persistido em `localStorage`
- Sessao operacional persistida em `localStorage`

### UI e theming

- Tailwind com muitas classes inline
- Tema `dark/light` por hook local em features e `ThemeProvider` no root
- Visual language fortemente customizada, orientada a cards, badges e dashboards

## Fonte de Verdade de Dados

### Cliente e seguranca

- Cliente base: `src/core/api/supabaseClient.js`
- Camada de dados principal: `src/core/api/supabaseSecure.js`

### Tabelas e entidades citadas pelo codigo ativo

- `public.usuarios`
- `public.registros_falhas`
- `public.avisos`
- `public.historico_concluidas` como fallback historico

### Campos de negocio importantes

- Em `usuarios`: `username`, `role`, `auth_user_id`, `force_password_change`, `setor_fixo`
- Em `registros_falhas`: `usuario`, `setor`, `trave`, `ponto`, `falha`, `solucao`, `data`, `status`, `resolvido_em`, `resolvido_por`
- Campos de ponto inoperante: `ponto_inoperante`, `inoperante_motivo`, `inoperante_observacao`, `inoperante_por`, `inoperante_em`
- Campos SIGA: `siga_enviado`, `siga_status`, `siga_enviado_em`, `siga_codigo_chamado`, `siga_data_abertura`, `siga_finalizado_em`

## Edge Functions Ativas

- `admin-users-create`
- `admin-users-list`
- `admin-users-delete`
- `user-clear-password-flag`

Uso principal:

- Criacao e listagem administrativa de usuarios
- Exclusao de usuarios via fluxo com permissao elevada
- Limpeza da flag de troca obrigatoria de senha

## Onde Criar Novos Arquivos

### Se a mudanca for de dominio funcional

- Criar dentro de `src/features/<feature>/`
- Exemplos:
- nova tela de falhas: `src/features/failures/pages/`
- novo hook da tela admin: `src/features/admin/hooks/`
- novo servico de dashboard: `src/features/dashboard/services/`

### Se a mudanca for transversal a varias features

- Hook generico: `src/shared/hooks/`
- Componente reutilizavel: `src/shared/components/`
- Constante global: `src/shared/constants/`
- Infra/autenticacao/api/validacao: `src/core/`

### Se a mudanca for banco, RLS ou backend gerenciado

- SQL, politicas e funcoes: `supabase/`

### Onde evitar criar codigo novo

- Evitar `src/components/`, `src/hooks/`, `src/services/`, `src/utils/`, `server/` e `api/` para novas implementacoes
- Esses caminhos representam a arquitetura anterior ou camadas de compatibilidade

## Alertas Arquiteturais Importantes

- O repositorio esta em migracao parcial de uma arquitetura antiga para uma arquitetura por features.
- Existem modulos duplicados com nomes parecidos, mas somente a versao em `src/features`, `src/core` e `src/shared` deve orientar novas alteracoes.
- `api/index.js` e `server/` ainda existem, porem o frontend atual conversa diretamente com Supabase; essa API nao e a espinha dorsal do produto hoje.
- `scripts/lint.mjs` e `docs/SEGURANCA.md` mostram intencao de limpeza e endurecimento de seguranca, mas ainda nao refletem totalmente o estado atual do repositorio.
- A suite de testes atual nao representa integralmente a arvore ativa; parte dela aponta para modulos antigos e hoje falha.

## Estado de Verificacao do Scan

- `npm run build`: passou em 12 de marco de 2026
- Testes `node:test`: falham atualmente por descompasso entre testes e modulos ativos, alem de uma expectativa divergente em `sanitizeString`

## Variavel Segura para `.env`

Nao publique isto em codigo versionado. Mantenha apenas em `.env` local ou no gerenciador de secrets do ambiente.

```env
PROJECT_CONTEXT_SUMMARY="App React 18 + Vite 5 para gestao operacional de falhas Lenovo com arquitetura ativa em src/app, src/core, src/features e src/shared; autenticacao e dados via Supabase Auth/Database/Edge Functions; dominios principais auth, dashboard KPI, admin, failures, home e monitoring; camada de dados central em src/core/api/supabaseSecure.js; rotas protegidas por role com suporte a runin_kiosk, admin e master; UI em Tailwind com hooks de pagina por feature; backend de referencia em supabase/ e existencia de camadas legadas/duplicadas em src/components, src/hooks, src/services, src/utils, server e api que nao devem ser usadas como padrao para novas alteracoes."
```

## System Prompt Para Outra IA

Voce e a IA especialista neste projeto. Considere como fonte de verdade apenas a arquitetura ativa baseada em `src/app`, `src/core`, `src/features`, `src/shared` e `supabase`, em um app `React 18 + Vite + Supabase` para gestao de falhas operacionais, dashboard KPI, admin, monitoramento e fluxo SIGA. Ao propor mudancas, preserve o padrao por feature, use `src/core/api/supabaseSecure.js` como camada principal de dados, respeite as roles (`master`, `admin`, `tecnico`, `colaborador`, `runin_kiosk`) e evite criar novas implementacoes na estrutura legada (`src/components`, `src/hooks`, `src/services`, `src/utils`, `server`, `api`) exceto em tarefas explicitas de migracao ou limpeza tecnica.
