# Lenovo Assets Systems

Sistema web de gestao operacional da Lenovo Indaiatuba para abertura, acompanhamento e conclusao de falhas tecnicas em setores `Runin` e `AVT`, com dashboard de KPI, painel administrativo, integracao com SIGA, assistente de IA e historico de novidades do produto.

## Objetivo do sistema

O produto centraliza a rotina operacional que antes ficava dispersa entre papel, memoria operacional e planilhas. Hoje o sistema cobre:

- abertura de chamados por setor, trave e ponto
- visualizacao e tratamento de falhas em aberto
- marcacao e acompanhamento de pontos inoperantes
- fluxo SIGA para chamados externos
- indicadores operacionais e exportacao de relatorios
- administracao de usuarios
- consulta assistida por IA com a Lei.A
- chat interno entre usuarios autenticados
- comunicacao de evolucoes do sistema via Lenovo News

## Stack atual

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Roteamento | React Router DOM 6 |
| Estilos | Tailwind CSS |
| Graficos | Recharts |
| Backend | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| IA | Google Gemini 2.5 Flash via Edge Function proxy |
| PDF | jsPDF + html-to-image |
| Excel | SheetJS (`xlsx`) |
| Deploy | Vercel |

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

Use `.env.example` como base.

Variaveis do frontend:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
PROJECT_CONTEXT_SUMMARY="RESUMO_TECNICO_PRIVADO_DO_PROJETO"
```

Segredo da IA no Supabase Edge Functions:

```bash
supabase secrets set GEMINI_API_KEY=SUA_GEMINI_API_KEY
```

### 3. Subir ambiente de desenvolvimento

```bash
npm run dev
```

### 4. Gerar build de producao

```bash
npm run build
```

## Estrutura real do projeto

```text
sistema-de-gestao/
├── public/
│   └── version.json
├── docs/
│   └── SEGURANCA.md
├── scripts/
│   ├── lint.mjs
│   └── migrate-users-to-auth.js
├── src/
│   ├── app/
│   │   └── router/
│   ├── components/
│   │   └── SupportMenuItem.jsx
│   ├── core/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── theme/
│   │   └── validation/
│   ├── features/
│   │   ├── admin/
│   │   ├── ai-assistant/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── failures/
│   │   ├── home/
│   │   ├── monitoring/
│   │   └── news/
│   ├── hooks/
│   │   └── useOnlineUsers.js
│   ├── shared/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   └── styles/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── DB_CANONICAL_SETUP.sql
│   ├── MIGRATION_AUTH.sql
│   ├── RLS_POLICIES.sql
│   └── functions/
├── tests/
├── api/
│   └── index.js
├── ARCHITECTURE.md
└── README.md
```

## Mapa funcional por pasta

### `src/app/router/`
Define as rotas da aplicacao e os layouts protegidos por sessao e role.

### `src/core/`
Camada transversal da aplicacao.

- `api/supabaseClient.js`: cliente base do Supabase
- `api/supabaseSecure.js`: operacoes principais de leitura e escrita, com validacao e regras operacionais
- `auth/session.js`: sessao local e helpers de role
- `theme/theme.jsx`: provider de tema global
- `validation/validation.js`: sanitizacao e validacao de entradas

### `src/features/`
Camada principal de dominio, organizada por feature.

#### `auth`
- login com Supabase Auth
- mapeamento `username -> email lenovo.app`
- troca obrigatoria de senha no primeiro acesso
- logout

#### `dashboard`
- cockpit principal de KPI
- filtros por periodo
- metricas agregadas
- exportacao de relatorio PDF em dois fluxos
- historico, SIGA, aging e pontos inoperantes

#### `failures`
- abertura de chamado
- entrada kiosk para `runin_kiosk`
- visualizacao de falhas em aberto
- conclusao total ou parcial
- pontos inoperantes
- envio e finalizacao via SIGA
- historico recente por ponto
- leitura operacional por setor e trave

#### `admin`
- gestao de usuarios
- importacao e exportacao de historico
- abas de indicadores, usuarios, estatisticas e historico
- cockpit administrativo rapido
- Edge Functions para criacao, listagem e remocao de usuarios

#### `ai-assistant`
- Lei.A como pagina dedicada e widget flutuante
- consulta de falhas, pontos inoperantes, avisos, KPIs e historico
- tool calling via Gemini proxy
- respostas orientadas ao contexto operacional da planta

#### `chat`
- conversas internas ponto a ponto entre usuarios autenticados
- mensagens em tempo real com Supabase Realtime
- notificacoes de nao lidas por remetente
- janelas simultaneas no desktop e conversa compacta no mobile
- integracao direta com a secao `Suporte`
- criacao automatica de conversa minimizada quando chega mensagem nova
- leitura tratada quando a janela realmente recebe foco
- adaptacao visual para `dark` e `light mode`

#### `home`
- feed de avisos
- publicacao de aviso por `master`
- atalhos rapidos por setor

#### `monitoring`
- tela de TV/monitor operacional em tempo real
- consolidacao de alertas por setor
- destaque para paradas criticas

#### `news`
- cards de novidades no dashboard
- popup automatico por usuario
- pagina de arquivo em `/novidades`
- historico manual de releases em `newsData.js`

### `src/shared/`
Recursos reutilizaveis entre features.

- `components/layout/AppBottomNav.jsx`: navegacao mobile
- `components/filters/DateRangePicker.jsx`: filtro de datas reutilizavel
- `constants/setores.js`: lista mestra de setores
- `constants/falhasComuns.js`: insumos/falhas padrao
- `hooks/usePersistentTheme.js`: persistencia de tema por tela
- `hooks/useBodyScrollLock.js`: trava de scroll para overlays e menus
- `styles/global.css`: estilos globais do projeto

### `src/components/SupportMenuItem.jsx`
Componente compartilhado da secao `Suporte`, embutido na navegacao, com usuarios online e offline em tempo real, abertura de conversas e badges de mensagens nao lidas.

### `src/hooks/useOnlineUsers.js`
Hook compartilhado de presence usando Supabase Realtime, incluindo o mapeamento do `auth_user_id` necessario para abrir conversas entre usuarios.

O hook consome uma camada segura de visibilidade para suporte/chat, permitindo que usuarios autenticados se vejam em `online/offline` sem expor a leitura ampla da tabela principal de perfis nas telas administrativas.

### `supabase/`
Fonte de verdade do backend gerenciado.

- `DB_CANONICAL_SETUP.sql`: base canônica do banco
- `MIGRATION_AUTH.sql`: migracao para Supabase Auth
- `RLS_POLICIES.sql`: politicas de acesso
- `functions/`: Edge Functions ativas do sistema
- `migrations/mensagens_chat.sql`: base SQL da feature de chat interno

## Rotas ativas

| Rota | Funcao |
|---|---|
| `/` | Login |
| `/dashboard` | Pagina principal apos login |
| `/home` | Feed de avisos |
| `/fale-conosco` | Pagina de contato |
| `/registrar` | Registro manual de falhas |
| `/visualizar` | Tratamento e monitoramento de falhas |
| `/monitor-tv` | Painel TV operacional |
| `/assistente` | Pagina dedicada da Lei.A |
| `/novidades` | Arquivo completo de novidades |
| `/abrir-chamado` | Entrada principal de abertura, inclusive kiosk |
| `/alterar-senha` | Troca de senha |
| `/admin` | Painel administrativo |
| `/admin/cockpit` | Cockpit admin resumido |

## Comunicacao interna e novidades

- O item `Suporte` da navegacao concentra usuarios online/offline e o acesso ao chat interno.
- O chat e aditivo: nao cria rota nova e nao altera o fluxo principal das paginas.
- Quando chega mensagem nova em conversa ainda nao aberta, o sistema pode criar o chat minimizado como alerta visual.
- A notificacao de mensagem some quando a janela da conversa realmente recebe foco.
- O popup de novidades continua aparecendo apenas uma vez por usuario, agora tambem cobrindo a entrega do `LeChat Beta`.

## Regras de acesso

Perfis suportados hoje:

- `master`
- `admin`
- `tecnico`
- `colaborador`
- `runin_kiosk`

Comportamento geral:

- `master`: acesso total, inclusive remocao de usuarios
- `admin`: acesso amplo ao painel admin, sem privilegios de `master`
- `tecnico`: operacao de falhas e consulta do sistema
- `colaborador`: abertura de chamado e uso operacional restrito
- `runin_kiosk`: fluxo travado para o setor fixo no kiosk

## Banco e entidades principais

Tabela operacional principal:

- `public.registros_falhas`

Campos de negocio relevantes:

- `setor`, `trave`, `ponto`, `falha`, `status`, `data`
- `solucao`, `resolvido_em`, `resolvido_por`
- `ponto_inoperante`, `inoperante_motivo`, `inoperante_observacao`, `inoperante_por`, `inoperante_em`
- `siga_enviado`, `siga_status`, `siga_enviado_em`, `siga_codigo_chamado`, `siga_data_abertura`, `siga_finalizado_em`

Outras tabelas usadas no app:

- `public.usuarios`
- `public.avisos`
- `public.historico_concluidas`
- `public.mensagens_chat`

Camada segura complementar:

- `public.usuarios_chat_visiveis`: view usada por `Suporte` e `LeChat` para listar usuarios visiveis no presence/chat sem abrir a tabela `usuarios` de forma ampla para toda a interface
- essa view expõe apenas os campos minimos necessarios ao suporte/chat e nao substitui o fluxo administrativo de gestao de equipe

## Edge Functions ativas

| Function | Funcao |
|---|---|
| `admin-users-create` | Criacao de usuario |
| `admin-users-list` | Listagem administrativa de usuarios |
| `admin-users-delete` | Exclusao de usuario |
| `gemini-proxy` | Proxy autenticado para Gemini |
| `user-clear-password-flag` | Limpeza da flag de troca obrigatoria de senha |
| `user-mark-news-seen` | Persistencia da leitura de novidades |

## Lei.A

A Lei.A e a assistente oficial do sistema.

Hoje ela consegue:

- consultar falhas abertas e concluidas
- consultar pontos inoperantes em aberto
- consultar avisos
- resumir KPIs do dashboard
- consultar historico concluido

Fluxo atual:

1. o usuario escreve no chat
2. o frontend monta o contexto e envia para a Edge Function `gemini-proxy`
3. a Edge valida a autenticacao pelo JWT do usuario
4. o Gemini decide se chama tool
5. o frontend executa a tool de leitura correspondente
6. o resultado volta ao modelo
7. a resposta final aparece no widget ou na pagina da Lei.A

Observacao importante:
- o modelo atual configurado no proxy e `gemini-2.5-flash`

## Dashboard e relatorios

O dashboard combina datasets do Supabase para montar metricas como:

- total geral
- pendentes e concluidas
- chamados inseridos no sistema
- distribuicao por setor
- top falhas
- aging
- pontos com historico
- leitura SIGA
- pontos inoperantes em aberto e concluidos

Fluxos de PDF:

- fluxo executivo com `jsPDF + html-to-image`
- fluxo HTML/impressao para relatorio completo

## Lenovo News

O sistema de novidades funciona assim:

- o dashboard mostra as 2 novidades mais recentes
- o popup aparece quando existe versao nova para o usuario
- a pagina `/novidades` mostra o historico completo
- o controle de leitura fica salvo em `usuarios.news_seen_version`
- a versao publica em uso fica em `public/version.json`
- a entrega do chat interno foi consolidada no historico como `LeChat Beta`, evitando duplicidade no arquivo de novidades

No estado atual:

- versao mais recente cadastrada: `1.6.1`

## Suporte em tempo real

A navegacao possui a secao `Suporte`, que mostra:

- usuarios online
- usuarios offline
- destaque para o usuario atual
- sincronizacao por Supabase Presence
- acesso ao `LeChat` a partir da mesma lista

Regras importantes:

- todos os usuarios autenticados podem se ver no contexto de suporte/chat
- isso nao significa abrir a tabela principal de usuarios para a gestao de equipe
- essa separacao e feita pela view `usuarios_chat_visiveis`

Essa secao aparece no desktop e no mobile.

## Scripts auxiliares

| Script | Funcao |
|---|---|
| `npm run dev` | desenvolvimento |
| `npm run build` | build de producao |
| `npm run lint` | lint do frontend |
| `node scripts/lint.mjs` | guardrails de migracao/seguranca |
| `node scripts/migrate-users-to-auth.js` | migracao de usuarios para Supabase Auth |

## Testes atuais

A pasta `tests/` contem cobertura pontual para:

- metricas de dashboard
- utilitarios de falhas
- validacao de inputs

Nao e uma suite completa do sistema inteiro, mas cobre partes importantes da logica utilitaria ativa.

## Observacoes importantes para manutencao

- A camada principal de dados do projeto e `src/core/api/supabaseSecure.js`
- A lista mestra de setores fica em `src/shared/constants/setores.js`
- A lista mestra de falhas comuns fica em `src/shared/constants/falhasComuns.js`
- O roteamento real do sistema esta em `src/app/router/AppRouter.jsx`
- O endpoint `api/index.js` existe apenas como compatibilidade e retorna API legada desativada

## Documentos relacionados

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/SEGURANCA.md](./docs/SEGURANCA.md)
