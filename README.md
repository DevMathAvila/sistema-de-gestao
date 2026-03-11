# Sistema de Gestao de Falhas

Aplicacao React + Vite para operacao de Run In e AVT com abertura, acompanhamento e conclusao de falhas, fluxo SIGA, painel administrativo, monitoramento e dashboard KPI com exportacao PDF.

## Stack

- React 18
- Vite 5
- React Router 6
- Supabase Auth + Database + Edge Functions
- Tailwind CSS
- Recharts
- jsPDF + html-to-image
- XLSX

## Principais modulos

- `Login`: autenticacao por username + senha usando Supabase Auth.
- `Dashboard KPI`: visoes Executivo, Operacao, SIGA e Historico com exportacao PDF.
- `Falhas`: registro, visualizacao, conclusao, envio para SIGA e tratamento de pontos inoperantes.
- `Run In Kiosk`: fluxo restrito para usuarios vinculados a um setor fixo.
- `Admin`: usuarios, pareto, historico geral, importacao de concluidos e exportacao Excel.
- `Monitor TV`: painel de acompanhamento operacional.

## Estrutura principal

```txt
src/
  app/router/
  core/
    api/
    auth/
    theme/
    validation/
  features/
    admin/
    auth/
    dashboard/
    failures/
    home/
    monitoring/
  shared/
    components/
    constants/
    hooks/
    styles/
server/
  api/
  config/
  constants/
  services/
supabase/
  DB_CANONICAL_SETUP.sql
  MIGRATION_AUTH.sql
  RLS_POLICIES.sql
  functions/
    admin-users-create/
    admin-users-list/
    admin-users-delete/
    user-clear-password-flag/
scripts/
tests/
```

## Funcionalidades atuais

### Falhas

- Abertura por `setor`, `trave`, `ponto` e `falha`.
- Conclusao total ou parcial de falhas.
- Historico por ponto.
- Tratamento de pontos inoperantes.
- Encaminhamento e finalizacao via SIGA.

### Dashboard KPI

- Abas `Executivo`, `Operacao`, `SIGA` e `Historico`.
- KPI geral de pendentes, concluidas e volume por setor.
- Destaques operacionais por setor com foco em concluido, pendencias restantes e top falha.
- Aging de pendencias.
- Resumo de pontos inoperantes abertos e concluidos.
- Exportacao PDF em modo executivo ou completo por secoes.

### Admin

- Criacao de usuarios via Edge Functions.
- Exclusao de usuarios por `master`.
- Pareto de falhas.
- Historico geral de concluidas e abertas.
- Exportacao Excel do historico.
- Importacao de falhas concluidas por planilha Excel/CSV.
- Deteccao de duplicidade na importacao por `setor + trave + ponto + falha`.
- Historico geral paginado em lotes de 30 itens.

### Monitoramento e navegacao

- Monitor TV para acompanhamento de status.
- Home e Fale Conosco.
- Tema claro/escuro persistido localmente.
- Navegacao adaptada para mobile e desktop.

## Autenticacao

O projeto usa Supabase Auth com email derivado do username.

- Login digitado pelo usuario: `mavila`
- Email utilizado internamente: `mavila@lenovo.app`

O perfil operacional fica em `public.usuarios`, incluindo:

- `username`
- `role`
- `auth_user_id`
- `force_password_change`
- `setor_fixo`

## Perfis suportados

- `master`
- `admin`
- `tecnico`
- `colaborador`
- `runin_kiosk`

### Regras importantes

- `runin_kiosk` acessa `/abrir-chamado` no modo kiosk.
- Usuarios kiosk ficam restritos ao `setor_fixo`.
- Alteracao de senha chama a Edge Function `user-clear-password-flag`.

## Rotas principais

- `/`
- `/dashboard`
- `/home`
- `/fale-conosco`
- `/abrir-chamado`
- `/registrar`
- `/visualizar`
- `/monitor-tv`
- `/alterar-senha`
- `/admin`
- `/admin/cockpit`

## Variaveis de ambiente

Crie `.env` ou `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
```

Sem essas variaveis o app nao inicializa.

## Banco de dados esperado

Tabelas principais usadas hoje:

- `public.registros_falhas`
- `public.usuarios`
- `public.avisos`
- `public.historico_concluidas` como fallback/consulta historica por ponto, quando existir

### Campos relevantes em `registros_falhas`

- `usuario`
- `setor`
- `trave`
- `ponto`
- `falha`
- `solucao`
- `data`
- `status`
- `resolvido_em`
- `resolvido_por`

### Campos de ponto inoperante

- `ponto_inoperante`
- `inoperante_motivo`
- `inoperante_observacao`
- `inoperante_por`
- `inoperante_em`

### Campos SIGA

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

Necessario configurar as secrets do projeto, incluindo `SERVICE_ROLE_KEY`, para as funcoes administrativas.

## Importacao de concluidos

Disponivel em `Admin > Historico Geral > Falhas Concluidas`.

Formato aceito de planilha:

- `Setor` ou `Run In`
- `Trave`
- `Ponto`
- `Falha` ou `Tipo de Falha`
- `Descricao`
- `Dia` ou `Data de Conclusao`
- `Finalizado` ou `Finalizado por`
- `Criado por`

Comportamento atual:

- normaliza `ponto` numerico para `Ponto X`
- ignora duplicados quando ja existe combinacao igual de `setor + trave + ponto + falha`
- importa registros diretamente como `CONCLUIDO`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Testes

Arquivos atuais em `tests/`:

- `tests/dashboardMetrics.test.mjs`
- `tests/failureUtils.test.mjs`
- `tests/validation.test.mjs`

Nao existe script `npm test` configurado no `package.json` neste momento.

## Troubleshooting

### `Missing Supabase env vars`

Confirme `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### `Edge Function (401): Invalid JWT`

- confira se `.env` aponta para o mesmo projeto das Edge Functions
- refaca login para renovar a sessao
- confirme o deploy das functions no projeto correto

### KPI sem dados ou com falha parcial

- revise RLS e schema de `registros_falhas`
- confira filtros de data
- valide a existencia das colunas de SIGA e ponto inoperante

### Importacao de concluidos falhando

- confirme os cabecalhos da planilha
- valide a coluna de data
- confira se o `setor` esta dentro da lista suportada (`Runin 01-10`, `AVT 01-10`)

