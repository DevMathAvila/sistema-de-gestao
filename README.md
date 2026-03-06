# Sistema de Gestao de Falhas

Aplicacao React + Vite para operacao de Run In: abertura de chamados, visualizacao e fechamento de falhas, fluxo SIGA, administracao de usuarios e KPI com exportacao PDF.

## Stack
- React 18
- Vite 5
- Supabase (Auth, Database, Edge Functions)
- Tailwind CSS
- Recharts
- XLSX

## Estrutura principal

```txt
src/
  app/router/
  core/
    api/
    auth/
    validation/
  features/
    auth/
    failures/
    dashboard/
    admin/
    home/
    monitoring/
  shared/
    components/
    constants/
    hooks/
supabase/
  DB_CANONICAL_SETUP.sql
  MIGRATION_AUTH.sql
  RLS_POLICIES.sql
  functions/
    admin-users-create/
    admin-users-list/
    admin-users-delete/
    user-clear-password-flag/
```

## Funcionalidades

### Falhas
- Abertura por setor, trave, ponto e falha.
- Fechamento com solucao e tecnico responsavel.
- Painel de visualizacao em tempo real.

### SIGA
- Encaminhamento de falhas para SIGA.
- Painel de aguardando/finalizados.
- Campos de acompanhamento: codigo, data de abertura e finalizacao.

### Admin
- Criar usuario com senha provisoria.
- Excluir usuario (master).
- Historico e estatisticas.
- Gestao de equipe com feedback visual (sem `alert()`/`confirm()` nativos).

### Dashboard KPI
- Abas: Executivo, Operacao, SIGA, Historico.
- Ranking de falhas, aging, insights por setor.
- Exportacao PDF por secoes/presets.
- Metricas de tempo:
  - SIGA: total/medio/maximo de atendimento.
  - Geral: media de atendimento de chamados concluidos (`resolvido_em - data`).

## Autenticacao (modelo atual)

- Login com `nickname + senha` usando Supabase Auth.
- Email tecnico gerado como `${nickname}@lenovo.app`.
- Tabela `public.usuarios` com perfil (role, vinculo, flags).
- Primeiro acesso forca troca de senha (`force_password_change = true`).

## Variaveis de ambiente

Crie `.env.local` (ou `.env`) na raiz:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
```

Sem essas variaveis o app nao inicializa (`Missing Supabase env vars`).

## Banco de dados esperado

Tabelas usadas no fluxo atual:
- `public.registros_falhas`
- `public.usuarios`
- `public.avisos`

Campos SIGA obrigatorios em `registros_falhas`:
- `siga_enviado`
- `siga_status`
- `siga_enviado_em`
- `siga_codigo_chamado`
- `siga_data_abertura`
- `siga_finalizado_em`

Arquivos SQL de referencia:
- `supabase/DB_CANONICAL_SETUP.sql`
- `supabase/MIGRATION_AUTH.sql`
- `supabase/RLS_POLICIES.sql`

## Edge Functions usadas

- `admin-users-create`
- `admin-users-list`
- `admin-users-delete`
- `user-clear-password-flag`

Necessario configurar `SERVICE_ROLE_KEY` nas secrets das functions.

## Troubleshooting rapido

### `Edge Function (401): Invalid JWT`
- Verifique se `.env` aponta para o mesmo projeto das functions.
- Refaça login para renovar sessao.
- Confirme deploy das functions no mesmo `project-ref`.
- Enquanto corrige ambiente, `admin-users-list` possui fallback de leitura direta via RLS para a tela de gestao nao ficar vazia.

### KPI sem dados
- Confirme RLS e schema de `registros_falhas`.
- Confira filtros de data.
- O painel exibe erro parcial no topo quando alguma consulta falha.

## Rotas principais
- `/`
- `/dashboard`
- `/abrir-chamado`
- `/registrar`
- `/visualizar`
- `/admin`
- `/admin/cockpit`
- `/monitor-tv`
- `/alterar-senha`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```
