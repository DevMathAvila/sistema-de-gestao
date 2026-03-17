# Lenovo Assets Systems

Sistema web de gestão operacional de falhas técnicas para as linhas de produção **Run In** e **AVT** da Lenovo Indaiatuba, SP. Desenvolvido do zero com React 18 + Vite 5 + Supabase, em produção desde 03/03/2026.

---

## Visão Geral

Antes do sistema, o controle de falhas era feito em papel e planilhas Excel — sem histórico estruturado, sem visibilidade em tempo real e sem rastreabilidade de quem resolveu o quê e quando.

O Lenovo Assets Systems centraliza todo esse fluxo:

- Técnicos registram falhas digitalmente em segundos
- Gestores acompanham KPIs em tempo real no dashboard
- Histórico completo por ponto, trave, setor e período
- Integração com o sistema SIGA rastreada internamente
- Exportação de relatórios em PDF e Excel
- Assistente de IA integrada (**Lei.A**) para consultas e registros via chat

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Roteamento | React Router 6 |
| Estilização | Tailwind CSS |
| Gráficos | Recharts |
| Backend | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| IA | Google Gemini 2.5 Flash-Lite (via Edge Function proxy) |
| Exportação PDF | jsPDF + html-to-image + jspdf-autotable |
| Exportação Excel | SheetJS (XLSX) |
| Deploy | Vercel + GitHub (CI/CD automático) |

---

## Estrutura de Pastas

```
sistema-de-gestao/
├── public/
│   └── version.json              # Controle de versão para o sistema de novidades
│
├── src/
│   ├── app/
│   │   └── router/               # Definição de rotas (AppRouter.jsx)
│   │
│   ├── core/                     # Infraestrutura base da aplicação
│   │   ├── api/
│   │   │   ├── supabaseClient.js # Instância global do Supabase
│   │   │   └── supabaseSecure.js # Queries seguras com sanitização e timezone
│   │   ├── auth/
│   │   │   ├── authService.js    # Login, logout, troca de senha
│   │   │   └── session.js        # Gerenciamento de sessão local
│   │   ├── theme/
│   │   │   └── theme.jsx         # Provider de tema claro/escuro
│   │   └── validation/
│   │       └── validation.js     # Sanitização e validação de inputs
│   │
│   ├── features/                 # Domínios da aplicação
│   │   ├── admin/                # Painel administrativo
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── ai-assistant/         # Lei.A — Assistente de IA
│   │   │   ├── components/
│   │   │   │   ├── LeiaWidget.jsx    # Widget flutuante completo
│   │   │   │   ├── LeiaBubble.jsx    # Botão circular pulsante
│   │   │   │   ├── LeiaChatPanel.jsx # Painel de chat
│   │   │   │   └── LeiaMessage.jsx   # Componente de mensagem
│   │   │   ├── constants/
│   │   │   │   └── aiSystemPrompt.js # System prompt com personalidade da Lei.A
│   │   │   ├── hooks/
│   │   │   │   └── useAIAssistant.js # Lógica completa do chat + tool calling
│   │   │   ├── pages/
│   │   │   │   └── AIAssistantPage.jsx
│   │   │   └── services/
│   │   │       ├── aiService.js  # Chamada à Edge Function gemini-proxy
│   │   │       └── aiTools.js    # Declarações das tools do Gemini
│   │   ├── auth/                 # Login, logout, troca de senha
│   │   ├── dashboard/            # Dashboard KPI
│   │   ├── failures/             # Registro e gestão de falhas
│   │   ├── home/                 # Página inicial e Fale Conosco
│   │   ├── monitoring/           # Monitor TV
│   │   └── news/                 # Sistema de novidades
│   │       ├── components/
│   │       │   ├── LenovoNewsLogo.jsx # Identidade visual do arquivo de novidades
│   │       │   ├── NewsDetailModal.jsx # Modal com detalhes completos da atualização
│   │       │   └── NewsPopup.jsx # Popup automático de novidades
│   │       ├── constants/
│   │       │   ├── newsData.js   # Dados das versões/novidades (cadastro manual)
│   │       │   └── newsMeta.js   # Meta visual, formatação e ordenação do arquivo
│   │       ├── hooks/
│   │           └── useNews.js    # Controle de visto/não visto por usuário
│   │       └── pages/
│   │           └── NewsArchivePage.jsx # Página com histórico completo de novidades
│   │
│   └── shared/                   # Recursos compartilhados entre features
│       ├── components/           # Componentes reutilizáveis
│       ├── constants/
│       │   ├── setores.js        # Lista de setores (LISTA_SETORES)
│       │   └── falhasComuns.js   # Falhas pré-cadastradas (FALHAS_COMUNS)
│       ├── hooks/                # Hooks globais reutilizáveis
│       └── styles/               # Estilos globais
│
├── supabase/
│   ├── DB_CANONICAL_SETUP.sql    # Script único de setup do banco
│   ├── MIGRATION_AUTH.sql        # Migração para Supabase Auth
│   ├── RLS_POLICIES.sql          # Políticas de Row Level Security
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts           # Headers CORS compartilhados
│       ├── admin-users-create/   # Criação de usuários (service_role)
│       ├── admin-users-delete/   # Exclusão de usuários (service_role)
│       ├── admin-users-list/     # Listagem de usuários (service_role)
│       ├── gemini-proxy/         # Proxy seguro para a API do Gemini
│       └── user-clear-password-flag/ # Limpeza de flag de troca de senha
│
├── scripts/                      # Scripts auxiliares de desenvolvimento
├── .env.example                  # Modelo de variáveis de ambiente
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Módulos Principais

### Falhas
Núcleo do sistema. Gerencia todo o ciclo de vida de uma falha operacional.

- Abertura por `setor`, `trave`, `ponto` e tipo de falha
- Conclusão total ou parcial com solução registrada
- Histórico completo por ponto
- Tratamento de pontos inoperantes (motivo, observação, responsável)
- Encaminhamento para o SIGA com rastreamento de status (AGUARDANDO → FINALIZADO)

### Dashboard KPI
Painel gerencial com 4 abas:

- **Executivo** — visão geral de pendentes, concluídas e volume por setor
- **Operação** — destaques operacionais por setor, top falhas e aging de pendências
- **SIGA** — acompanhamento de chamados enviados ao sistema elétrico
- **Histórico** — consulta histórica com filtros por período

Exportação PDF em modo executivo (resumido) ou completo por seções.

### Admin
Painel restrito para perfis `admin` e `master`:

- Criação, listagem e exclusão de usuários via Edge Functions
- Pareto de falhas por tipo e setor
- Histórico geral paginado (lotes de 30 itens)
- Exportação Excel do histórico completo
- Importação de falhas concluídas via planilha Excel/CSV
- Detecção de duplicidade na importação por `setor + trave + ponto + falha`

### Lei.A — Assistente de IA
Agente de IA integrado ao sistema como widget flutuante persistente.

**Como funciona:**
1. Usuário envia mensagem no chat
2. Frontend chama a Edge Function `gemini-proxy` com o token JWT da sessão
3. A Edge Function valida a autenticação e repassa ao Gemini com a chave de API segura
4. O Gemini decide se precisa consultar dados (tool calling)
5. Se sim, executa a query no Supabase e retorna o resultado ao Gemini
6. Gemini formula a resposta em linguagem natural
7. Resposta aparece no chat

**Tools disponíveis:**

| Tool | Descrição |
|---|---|
| `query_registros_falhas` | Falhas abertas/concluídas com filtros |
| `query_avisos` | Avisos ativos do sistema |
| `query_dashboard_kpis` | Métricas agregadas por período |
| `query_historico_concluidas` | Histórico de falhas concluídas |
| `query_pontos_inoperantes` | Pontos inoperantes por setor |
| `query_falhas_siga` | Chamados no SIGA por status |
| `query_falhas_por_ponto` | Histórico de um ponto específico |
| `query_setores_disponiveis` | Lista todos os setores |
| `query_resumo_setor` | Resumo completo de um setor |
| `solicitar_insercao_falha` | Prepara inserção com confirmação |
| `executar_insercao_falha` | Executa após CONFIRMAR |
| `solicitar_atualizacao_falha` | Prepara atualização com confirmação |
| `executar_atualizacao_falha` | Executa após CONFIRMAR |
| `gerar_relatorio_pdf` | Gera e baixa relatório PDF |
| `gerar_relatorio_excel` | Gera e baixa planilha Excel |

**Personalidade:**
A Lei.A tem identidade própria — nome feminino, tom descontraído, saudações adaptadas ao horário do usuário, usa o nome de quem está logado e conhece o sistema por dentro.

### Sistema de Novidades
Mecanismo de comunicação com os usuários integrado ao dashboard:

- Seção **Lenovo News** na página inicial com cards das versões mais recentes
- Botão **Visualizar todas** levando para a rota `/novidades`
- Página de arquivo com todas as atualizações cadastradas, exibindo as mais recentes primeiro
- Popup automático ao logar quando há versão não vista pelo usuário
- Polling a cada 5 minutos em `/public/version.json` — novidades chegam ao vivo sem recarregar
- Histórico de versões consultável

**Para publicar uma novidade:**
1. Editar `src/features/news/constants/newsData.js`
2. Atualizar `NEWS_VERSION_LATEST`
3. Adicionar entrada no início do array `NEWS_DATA`
4. Atualizar `public/version.json` com a mesma versão
5. Fazer deploy — o popup aparece automaticamente para todos os usuários

**Comportamento atual:**
- O Dashboard mostra somente as 2 novidades mais recentes
- A página `/novidades` mostra todas as entradas cadastradas no arquivo histórico
- A ordenação do arquivo prioriza as novidades mais recentes no topo

---

## Autenticação

Supabase Auth com email derivado do username:

- Login digitado: `mavila`
- Email interno: `mavila@lenovo.app`

O perfil operacional fica em `public.usuarios`:

| Campo | Descrição |
|---|---|
| `username` | Nome de usuário |
| `role` | Perfil de acesso |
| `auth_user_id` | FK para `auth.users` |
| `force_password_change` | Flag de troca obrigatória no primeiro login |
| `setor_fixo` | Setor travado para perfil `runin_kiosk` |

### Perfis de Acesso

| Perfil | Permissões |
|---|---|
| `master` | Acesso total, incluindo exclusão de usuários |
| `admin` | Acesso total exceto configurações de sistema |
| `tecnico` | Registra e fecha falhas |
| `colaborador` | Visualização apenas |
| `runin_kiosk` | Restrito ao `setor_fixo`, acessa apenas `/abrir-chamado` |

---

## Segurança

O sistema tem segurança em múltiplas camadas:

### Row Level Security (RLS)
Políticas implementadas diretamente no PostgreSQL — mesmo com a `anon_key` exposta, nenhum dado é acessível sem sessão autenticada válida:

- `registros_falhas` — SELECT/INSERT/UPDATE apenas para autenticados. **DELETE bloqueado permanentemente** via `USING (false)`
- `usuarios` — cada usuário vê apenas o próprio perfil. Admin/Master veem todos
- `avisos` — SELECT para todos autenticados, INSERT apenas para admin/master

### Edge Function Proxy (Gemini)
A chave da API do Gemini **não fica no bundle do frontend**. Ela é guardada como secret no Supabase e acessada exclusivamente pela Edge Function `gemini-proxy`, que valida o JWT antes de qualquer chamada.

### Variáveis de Ambiente
- `VITE_SUPABASE_ANON_KEY` — pública por design (segurança real é o RLS)
- `GEMINI_API_KEY` — secret exclusivo do Supabase, nunca no frontend
- `.env` nunca commitado (verificado no histórico do Git)

### Outras Medidas
- Sanitização de inputs antes de gravar no banco
- Rate limiting de 2s entre mensagens na Lei.A
- Operações privilegiadas (criar/deletar usuários) apenas via Edge Functions com `service_role`
- Rotas protegidas com verificação de sessão real no Supabase

---

## Banco de Dados

### Tabelas Principais

**`public.registros_falhas`**

| Campo | Descrição |
|---|---|
| `usuario` | Quem registrou |
| `setor` | Setor da falha |
| `trave` | Trave (apenas Run In) |
| `ponto` | Ponto com defeito |
| `falha` | Tipo(s) de falha |
| `solucao` | Solução aplicada |
| `data` | Data de abertura |
| `status` | Aberto / Concluído |
| `resolvido_em` | Timestamp de conclusão |
| `resolvido_por` | Quem resolveu |
| `ponto_inoperante` | Flag de inoperância |
| `inoperante_motivo` | Motivo da inoperância |
| `inoperante_por` | Quem marcou como inoperante |
| `inoperante_em` | Timestamp de inoperância |
| `siga_enviado` | Flag de envio ao SIGA |
| `siga_status` | AGUARDANDO / FINALIZADO |
| `siga_enviado_em` | Timestamp de envio |
| `siga_codigo_chamado` | Código do chamado SIGA |
| `siga_data_abertura` | Data de abertura no SIGA |
| `siga_finalizado_em` | Timestamp de finalização no SIGA |

### Funções SQL Auxiliares (RLS)
- `public.is_admin_or_master()` — verifica se o usuário é admin ou master
- `public.is_runin_kiosk()` — verifica se o usuário é kiosk
- `public.current_user_setor_fixo()` — retorna o setor fixo do usuário atual

---

## Edge Functions

| Função | Descrição |
|---|---|
| `admin-users-create` | Cria usuário no Supabase Auth + perfil em `public.usuarios` |
| `admin-users-list` | Lista todos os usuários com perfil completo |
| `admin-users-delete` | Remove usuário do Auth e da tabela de perfis |
| `user-clear-password-flag` | Limpa a flag `force_password_change` após troca |
| `gemini-proxy` | Proxy autenticado para a API do Gemini |

---

## Rotas

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Redirect para dashboard ou login | — |
| `/dashboard` | Dashboard KPI + Novidades | Todos |
| `/novidades` | Arquivo completo de novidades do sistema | Todos |
| `/home` | Página inicial | Todos |
| `/fale-conosco` | Canal de contato | Todos |
| `/abrir-chamado` | Registro de falhas | Todos |
| `/registrar` | Formulário de registro | Todos |
| `/visualizar` | Visualização de falhas | Todos |
| `/monitor-tv` | Painel de monitoramento | Todos |
| `/alterar-senha` | Troca de senha | Todos |
| `/admin` | Painel administrativo | Admin / Master |
| `/admin/cockpit` | Cockpit gerencial | Admin / Master |

---

## Variáveis de Ambiente

Crie `.env` ou `.env.local` na raiz baseado no `.env.example`:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
PROJECT_CONTEXT_SUMMARY="RESUMO_TECNICO_PRIVADO_DO_PROJETO"
```

> ⚠️ `.env` e `.env.local` **nunca** devem ser commitados.

### Vercel
Configure em `Project Settings > Environment Variables`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `PROJECT_CONTEXT_SUMMARY`

### Supabase Secrets (Edge Functions)
```bash
supabase secrets set GEMINI_API_KEY=SuaChaveAqui
supabase secrets set SERVICE_ROLE_KEY=SuaServiceRoleKey
```

Ou pelo Dashboard: `Supabase → Edge Functions → Manage secrets`

---

## Importação de Concluídos

Disponível em `Admin > Histórico Geral > Falhas Concluídas`.

**Colunas aceitas na planilha:**

| Coluna aceita | Descrição |
|---|---|
| `Setor` ou `Run In` | Setor da falha |
| `Trave` | Trave (Run In) |
| `Ponto` | Ponto numérico ou `Ponto X` |
| `Falha` ou `Tipo de Falha` | Tipo de ocorrência |
| `Descricao` | Descrição adicional |
| `Dia` ou `Data de Conclusao` | Data de conclusão |
| `Finalizado` ou `Finalizado por` | Responsável |
| `Criado por` | Quem registrou |

**Comportamento:**
- Normaliza ponto numérico para `Ponto X`
- Ignora duplicatas por `setor + trave + ponto + falha`
- Importa diretamente como `CONCLUIDO`

---

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build de produção
npm run build

# Deploy de Edge Function
npx supabase functions deploy gemini-proxy --no-verify-jwt
npx supabase functions deploy admin-users-create
```

---

## Desenvolvido por

**Matheus Avila** — Lenovo Indaiatuba, SP  
Início: 03/03/2026 | Em produção: sim

Desenvolvido com auxílio de **Claude (Anthropic)** para arquitetura e decisões técnicas, e **Codex (OpenAI)** para implementação no código.
