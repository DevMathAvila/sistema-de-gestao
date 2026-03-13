# Levantamento Lei.A

Gerado automaticamente a partir dos arquivos locais do projeto.

=== aiTools.js ===
Caminho completo: C:\Users\amanha\sistema-de-gestao\src\features\ai-assistant\services\aiTools.js

```js
export const AI_TOOL_DECLARATIONS = [
  {
    name: 'query_registros_falhas',
    description: 'Consulta registros de falhas com filtros opcionais por setor, status e periodo.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: { type: 'STRING', description: 'Nome do setor, ex: Runin 01 ou AVT 01.' },
        status: { type: 'STRING', description: 'aberto ou concluido.' },
        data_inicio: { type: 'STRING', description: 'Data inicial no formato YYYY-MM-DD.' },
        data_fim: { type: 'STRING', description: 'Data final no formato YYYY-MM-DD.' },
        limit: { type: 'NUMBER', description: 'Quantidade maxima de registros a retornar. Padrao 50.' },
      },
    },
  },
  {
    name: 'query_avisos',
    description: 'Consulta avisos recentes do sistema.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Quantidade maxima de avisos a retornar. Padrao 10.' },
      },
    },
  },
  {
    name: 'query_dashboard_kpis',
    description: 'Retorna metricas agregadas de falhas para um periodo.',
    parameters: {
      type: 'OBJECT',
      properties: {
        data_inicio: { type: 'STRING', description: 'Data inicial no formato YYYY-MM-DD.' },
        data_fim: { type: 'STRING', description: 'Data final no formato YYYY-MM-DD.' },
        setor: { type: 'STRING', description: 'Filtro opcional por setor.' },
      },
      required: ['data_inicio', 'data_fim'],
    },
  },
  {
    name: 'query_historico_concluidas',
    description: 'Consulta o historico de falhas concluidas.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: { type: 'STRING', description: 'Setor opcional.' },
        data_inicio: { type: 'STRING', description: 'Data inicial no formato YYYY-MM-DD.' },
        data_fim: { type: 'STRING', description: 'Data final no formato YYYY-MM-DD.' },
        limit: { type: 'NUMBER', description: 'Quantidade maxima de registros. Padrao 50.' },
      },
    },
  },
];

export function normalizeToolArgs(args = {}) {
  if (!args) return {};

  if (typeof args === 'string') {
    try {
      const parsed = JSON.parse(args);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  if (typeof args !== 'object') return {};
  return args;
}

```

=== Schema SQL - supabase/MIGRATION_AUTH.sql ===
Caminho completo: C:\Users\amanha\sistema-de-gestao\supabase\MIGRATION_AUTH.sql

```sql
-- =============================================================================
-- MIGRACAO PARA SUPABASE AUTH (usuarios sem email)
-- Execute no Supabase: SQL Editor → New query → Cole este conteúdo → Run
-- =============================================================================

-- 1) Adicionar coluna de vinculo com auth.users
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Flag para forcar troca de senha no primeiro login
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS force_password_change boolean DEFAULT true;

-- 2) Garantir username unico (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_username_lower_key
  ON public.usuarios (lower(username));

-- 3) FK para auth.users (permite null enquanto migra)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'usuarios_auth_user_id_fkey'
      AND table_name = 'usuarios'
  ) THEN
    ALTER TABLE public.usuarios
      ADD CONSTRAINT usuarios_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 4) (DEPOIS DA MIGRACAO) Descomente para travar null e remover senha
-- ALTER TABLE public.usuarios ALTER COLUMN auth_user_id SET NOT NULL;
-- ALTER TABLE public.usuarios DROP COLUMN IF EXISTS senha;

```

=== Schema SQL - supabase/RLS_POLICIES.sql ===
Caminho completo: C:\Users\amanha\sistema-de-gestao\supabase\RLS_POLICIES.sql

```sql
-- =============================================================================
-- RLS (Row Level Security) — Lenovo Asset System (Auth + Profiles)
-- Execute no Supabase: SQL Editor → New query → Cole este conteúdo → Run
-- =============================================================================

-- 1) TABELA: usuarios (perfil)
ALTER TABLE IF EXISTS public.usuarios ENABLE ROW LEVEL SECURITY;

-- Remover politicas antigas (se existirem)
DROP POLICY IF EXISTS "usuarios_select_anon" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_anon" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_anon" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_anon" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;

-- Apenas o proprio usuario autenticado pode ler seu perfil
CREATE POLICY "usuarios_select_own"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Bloqueia insert/update/delete via cliente
-- (essas operacoes ficam no Edge Function com service_role)


-- 2) TABELA: registros_falhas
ALTER TABLE IF EXISTS public.registros_falhas ENABLE ROW LEVEL SECURITY;

-- Remover politicas antigas
DROP POLICY IF EXISTS "registros_falhas_select_anon" ON public.registros_falhas;
DROP POLICY IF EXISTS "registros_falhas_insert_anon" ON public.registros_falhas;
DROP POLICY IF EXISTS "registros_falhas_update_anon" ON public.registros_falhas;
DROP POLICY IF EXISTS "registros_falhas_deny_delete_anon" ON public.registros_falhas;

-- SELECT: apenas autenticados
CREATE POLICY "registros_falhas_select_auth"
  ON public.registros_falhas FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: apenas autenticados
CREATE POLICY "registros_falhas_insert_auth"
  ON public.registros_falhas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: apenas autenticados (fechamento, SIGA, etc)
CREATE POLICY "registros_falhas_update_auth"
  ON public.registros_falhas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: bloqueado para cliente
DROP POLICY IF EXISTS "registros_falhas_delete_auth" ON public.registros_falhas;
CREATE POLICY "registros_falhas_deny_delete_auth"
  ON public.registros_falhas FOR DELETE
  TO authenticated
  USING (false);

-- =============================================================================
-- Apos executar, teste: login, registrar falha, fechar chamado, admin.
-- =============================================================================

```

=== Schema SQL - supabase/DB_CANONICAL_SETUP.sql ===
Caminho completo: C:\Users\amanha\sistema-de-gestao\supabase\DB_CANONICAL_SETUP.sql

```sql
-- =============================================================================
-- LENOVO ASSET SYSTEM - DB CANONICAL SETUP (UNICO SCRIPT)
-- Execute este arquivo no Supabase SQL Editor (uma vez).
-- Ele consolida estrutura + constraints + RLS sem conflito.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) EXTENSAO
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1) TABELA USUARIOS (PERFIL)
-- -----------------------------------------------------------------------------
alter table if exists public.usuarios
  add column if not exists auth_user_id uuid,
  add column if not exists force_password_change boolean default true,
  add column if not exists setor_fixo text;

create unique index if not exists usuarios_username_lower_key
  on public.usuarios (lower(username));
create index if not exists idx_usuarios_setor_fixo
  on public.usuarios (setor_fixo);

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'usuarios_auth_user_id_fkey'
      and table_schema = 'public'
      and table_name = 'usuarios'
  ) then
    alter table public.usuarios
      add constraint usuarios_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id)
      on delete cascade;
  end if;
end $$;

alter table public.usuarios drop constraint if exists usuarios_role_check;
alter table public.usuarios add constraint usuarios_role_check
check (role in ('master', 'admin', 'tecnico', 'técnico', 'colaborador', 'runin_kiosk'));

alter table public.usuarios drop constraint if exists usuarios_setor_fixo_check;
alter table public.usuarios add constraint usuarios_setor_fixo_check
check (
  role <> 'runin_kiosk'
  or setor_fixo in (
    'Runin 01', 'Runin 02', 'Runin 03', 'Runin 04', 'Runin 05',
    'Runin 06', 'Runin 07', 'Runin 08', 'Runin 09', 'Runin 10'
  )
);

-- -----------------------------------------------------------------------------
-- 2) TABELA AVISOS (COMPATIVEL COM O FRONT)
-- -----------------------------------------------------------------------------
create table if not exists public.avisos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  mensagem text not null,
  autor text not null,
  created_at timestamptz default now()
);

alter table if exists public.avisos
  add column if not exists titulo text,
  add column if not exists mensagem text,
  add column if not exists autor text,
  add column if not exists created_at timestamptz default now();

-- compatibilidade com estrutura antiga que usava criado_em
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='avisos' and column_name='criado_em'
  ) then
    execute 'update public.avisos set created_at = coalesce(created_at, criado_em) where created_at is null';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3) TABELA REGISTROS_FALHAS (NAO RECRIAR, SO NORMALIZAR)
-- -----------------------------------------------------------------------------
alter table if exists public.registros_falhas
  add column if not exists resolvido_em timestamptz,
  add column if not exists solucao text,
  add column if not exists resolvido_por text,
  add column if not exists ponto_inoperante boolean not null default false,
  add column if not exists inoperante_motivo text,
  add column if not exists inoperante_observacao text,
  add column if not exists inoperante_por text,
  add column if not exists inoperante_em timestamptz,
  add column if not exists siga_enviado boolean not null default false,
  add column if not exists siga_status text,
  add column if not exists siga_enviado_em timestamptz,
  add column if not exists siga_codigo_chamado text,
  add column if not exists siga_data_abertura date,
  add column if not exists siga_finalizado_em timestamptz;

update public.registros_falhas
set siga_status = 'AGUARDANDO'
where siga_enviado = true
  and (siga_status is null or btrim(siga_status) = '');

alter table public.registros_falhas
  drop constraint if exists chk_registros_falhas_siga_status;
alter table public.registros_falhas
  add constraint chk_registros_falhas_siga_status
  check (
    siga_status is null
    or siga_status in ('AGUARDANDO', 'FINALIZADO')
  );

alter table public.registros_falhas
  drop constraint if exists chk_registros_falhas_siga_fluxo;
alter table public.registros_falhas
  add constraint chk_registros_falhas_siga_fluxo
  check (
    siga_status is null
    or (siga_status = 'AGUARDANDO' and lower(status) like '%aberto%')
    or (siga_status = 'FINALIZADO' and lower(status) like '%conclu%')
  );

create index if not exists idx_registros_falhas_siga_enviado_status
  on public.registros_falhas (siga_enviado, status);
create index if not exists idx_registros_falhas_siga_status
  on public.registros_falhas (siga_status);
create index if not exists idx_registros_falhas_siga_enviado_em
  on public.registros_falhas (siga_enviado_em desc);
create index if not exists idx_registros_falhas_ponto_inoperante_status
  on public.registros_falhas (ponto_inoperante, status);

-- -----------------------------------------------------------------------------
-- 4) VINCULO PERFIL <-> AUTH.USERS (POR USERNAME)
-- -----------------------------------------------------------------------------
update public.usuarios u
set auth_user_id = a.id
from auth.users a
where lower(trim(u.username)) = split_part(lower(a.email), '@', 1)
  and (u.auth_user_id is null or u.auth_user_id <> a.id);

update public.usuarios
set force_password_change = coalesce(force_password_change, false);

-- -----------------------------------------------------------------------------
-- 5) RLS - LIMPEZA TOTAL DE POLITICAS LEGADAS
-- -----------------------------------------------------------------------------
alter table if exists public.usuarios enable row level security;
alter table if exists public.registros_falhas enable row level security;
alter table if exists public.avisos enable row level security;

drop policy if exists usuarios_select_anon on public.usuarios;
drop policy if exists usuarios_insert_anon on public.usuarios;
drop policy if exists usuarios_update_anon on public.usuarios;
drop policy if exists usuarios_delete_anon on public.usuarios;
drop policy if exists usuarios_deny_update_anon on public.usuarios;
drop policy if exists usuarios_deny_delete_anon on public.usuarios;
drop policy if exists usuarios_select_own on public.usuarios;
drop policy if exists usuarios_select_admin_all on public.usuarios;

drop policy if exists registros_falhas_select_anon on public.registros_falhas;
drop policy if exists registros_falhas_insert_anon on public.registros_falhas;
drop policy if exists registros_falhas_update_anon on public.registros_falhas;
drop policy if exists registros_falhas_delete_anon on public.registros_falhas;
drop policy if exists registros_falhas_deny_delete_anon on public.registros_falhas;
drop policy if exists registros_falhas_select_auth on public.registros_falhas;
drop policy if exists registros_falhas_insert_auth on public.registros_falhas;
drop policy if exists registros_falhas_update_auth on public.registros_falhas;
drop policy if exists registros_falhas_deny_delete_auth on public.registros_falhas;

drop policy if exists avisos_select_auth on public.avisos;
drop policy if exists avisos_insert_admin on public.avisos;

-- -----------------------------------------------------------------------------
-- 6) RLS NOVO (AUTH + PERFIL)
-- -----------------------------------------------------------------------------
-- helper sem recursao de policy
create or replace function public.is_admin_or_master()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.auth_user_id = auth.uid()
      and lower(u.role) in ('admin', 'master')
  );
$$;

create or replace function public.is_runin_kiosk()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.auth_user_id = auth.uid()
      and lower(u.role) = 'runin_kiosk'
  );
$$;

create or replace function public.current_user_setor_fixo()
returns text
language sql
security definer
set search_path = public
as $$
  select u.setor_fixo
  from public.usuarios u
  where u.auth_user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.is_admin_or_master() from public;
grant execute on function public.is_admin_or_master() to authenticated;
revoke all on function public.is_runin_kiosk() from public;
grant execute on function public.is_runin_kiosk() to authenticated;
revoke all on function public.current_user_setor_fixo() from public;
grant execute on function public.current_user_setor_fixo() to authenticated;

-- usuarios: usuario ve proprio perfil
create policy usuarios_select_own
on public.usuarios
for select
to authenticated
using (auth.uid() = auth_user_id);

-- usuarios: admin/master ve todos (para gestao de equipe no cliente)
create policy usuarios_select_admin_all
on public.usuarios
for select
to authenticated
using (public.is_admin_or_master());

-- usuarios: sem insert/update/delete pelo cliente (edge function com service role)

-- registros_falhas: operacao autenticada
create policy registros_falhas_select_auth
on public.registros_falhas
for select
to authenticated
using (
  public.is_runin_kiosk() = false
  or setor = public.current_user_setor_fixo()
);

create policy registros_falhas_insert_auth
on public.registros_falhas
for insert
to authenticated
with check (
  public.is_runin_kiosk() = false
  or setor = public.current_user_setor_fixo()
);

create policy registros_falhas_update_auth
on public.registros_falhas
for update
to authenticated
using (
  public.is_runin_kiosk() = false
)
with check (
  public.is_runin_kiosk() = false
);

create policy registros_falhas_deny_delete_auth
on public.registros_falhas
for delete
to authenticated
using (false);

-- avisos: leitura autenticada; insercao apenas admin/master
create policy avisos_select_auth
on public.avisos
for select
to authenticated
using (true);

create policy avisos_insert_admin
on public.avisos
for insert
to authenticated
with check (public.is_admin_or_master());

-- -----------------------------------------------------------------------------
-- 7) DIAGNOSTICO RAPIDO
-- -----------------------------------------------------------------------------
-- usuarios com vinculo
select username, role, auth_user_id
from public.usuarios
order by username;

-- conferência de perfis x auth
select u.username, u.auth_user_id, a.email
from public.usuarios u
left join auth.users a on a.id = u.auth_user_id
order by u.username;

```

=== Tabelas Identificadas ===
Observacao geral:
- Nao foi encontrado `supabase/migrations/`, `supabase/schema.sql` nem `supabase/seed.sql`.
- Os unicos arquivos `.sql` localizados no repositorio foram `supabase/MIGRATION_AUTH.sql`, `supabase/RLS_POLICIES.sql` e `supabase/DB_CANONICAL_SETUP.sql`.
- Nao foi encontrado nenhum `CREATE TYPE` ou `ENUM` nos SQLs lidos.
- A estrutura base completa de `public.registros_falhas` e `public.historico_concluidas` nao aparece integralmente em nenhum SQL do repositorio; abaixo eu diferencio o que esta explicitamente definido no schema e o que esta apenas inferido pelo codigo cliente.

1. public.registros_falhas
Origem:
- Alteracoes e constraints explicitas em `supabase/DB_CANONICAL_SETUP.sql`.
- Colunas base adicionais inferidas a partir de selecoes e inserts em `src/core/api/supabaseSecure.js` e `src/features/ai-assistant/hooks/useAIAssistant.js`.

Colunas explicitamente adicionadas no SQL:
- `resolvido_em timestamptz`
- `solucao text`
- `resolvido_por text`
- `ponto_inoperante boolean not null default false`
- `inoperante_motivo text`
- `inoperante_observacao text`
- `inoperante_por text`
- `inoperante_em timestamptz`
- `siga_enviado boolean not null default false`
- `siga_status text`
- `siga_enviado_em timestamptz`
- `siga_codigo_chamado text`
- `siga_data_abertura date`
- `siga_finalizado_em timestamptz`

Colunas base inferidas pelo codigo da aplicacao:
- `id` tipo nao declarado nos SQLs encontrados
- `usuario` tipo nao declarado nos SQLs encontrados
- `setor` tipo nao declarado nos SQLs encontrados
- `trave` tipo nao declarado nos SQLs encontrados
- `ponto` tipo nao declarado nos SQLs encontrados
- `falha` tipo nao declarado nos SQLs encontrados
- `data` tipo nao declarado nos SQLs encontrados
- `status` tipo nao declarado nos SQLs encontrados

Constraints explicitas encontradas:
- `chk_registros_falhas_siga_status`
  Regra: `siga_status is null or siga_status in ('AGUARDANDO', 'FINALIZADO')`
- `chk_registros_falhas_siga_fluxo`
  Regra:
  - `siga_status is null`
  - ou `siga_status = 'AGUARDANDO' and lower(status) like '%aberto%'`
  - ou `siga_status = 'FINALIZADO' and lower(status) like '%conclu%'`
- `ponto_inoperante` com `not null default false`
- `siga_enviado` com `not null default false`

Indices explicitos encontrados:
- `idx_registros_falhas_siga_enviado_status` em `(siga_enviado, status)`
- `idx_registros_falhas_siga_status` em `(siga_status)`
- `idx_registros_falhas_siga_enviado_em` em `(siga_enviado_em desc)`
- `idx_registros_falhas_ponto_inoperante_status` em `(ponto_inoperante, status)`

RLS ativa:
- `ALTER TABLE public.registros_falhas ENABLE ROW LEVEL SECURITY`
- Policy `registros_falhas_select_auth`
  Permite `SELECT` para `authenticated` quando o usuario nao e `runin_kiosk`, ou quando `setor = public.current_user_setor_fixo()`.
- Policy `registros_falhas_insert_auth`
  Permite `INSERT` para `authenticated` com a mesma regra de setor para `runin_kiosk`.
- Policy `registros_falhas_update_auth`
  Permite `UPDATE` para `authenticated` apenas quando `public.is_runin_kiosk() = false`.
- Policy `registros_falhas_deny_delete_auth`
  Bloqueia `DELETE` para `authenticated` com `using (false)`.

Tabelas de interesse relacionadas:
- Esta e a tabela principal associada aos termos `setor`, `trave` e `ponto`.
- Nao foi encontrada outra tabela com `ponto`, `runin`, `run_in`, `avt`, `setor` ou `trave` no nome dentro dos SQLs do repositorio.

2. public.historico_concluidas
Origem:
- Nao ha definicao SQL para essa tabela em nenhum arquivo `.sql` encontrado.
- A existencia da tabela foi inferida pelo codigo em `src/core/api/supabaseSecure.js` e `src/features/ai-assistant/hooks/useAIAssistant.js`.

Colunas inferidas pelas queries:
- `id` tipo nao declarado nos SQLs encontrados
- `setor` tipo nao declarado nos SQLs encontrados
- `trave` tipo nao declarado nos SQLs encontrados
- `ponto` tipo nao declarado nos SQLs encontrados
- `falha` tipo nao declarado nos SQLs encontrados
- `solucao` tipo nao declarado nos SQLs encontrados
- `resolvido_em` tipo nao declarado nos SQLs encontrados
- `resolvido_por` tipo nao declarado nos SQLs encontrados
- `usuario` tipo nao declarado nos SQLs encontrados
- `data` tipo nao declarado nos SQLs encontrados
- `ponto_inoperante` tipo nao declarado nos SQLs encontrados
- `inoperante_motivo` tipo nao declarado nos SQLs encontrados
- `inoperante_observacao` tipo nao declarado nos SQLs encontrados
- `inoperante_por` tipo nao declarado nos SQLs encontrados
- `inoperante_em` tipo nao declarado nos SQLs encontrados

Constraints:
- Nao encontradas nos SQLs do repositorio.

Policies RLS:
- Nao encontradas nos SQLs do repositorio.

Tipos customizados / ENUM:
- Nao encontrados nos SQLs do repositorio.

3. public.usuarios
Origem:
- Alteracoes em `supabase/MIGRATION_AUTH.sql` e `supabase/DB_CANONICAL_SETUP.sql`.

Colunas explicitamente adicionadas no SQL:
- `auth_user_id uuid`
- `force_password_change boolean default true`
- `setor_fixo text`

Colunas adicionais inferidas pelo codigo e pelos selects:
- `id` tipo nao declarado nos SQLs encontrados
- `username` tipo nao declarado nos SQLs encontrados
- `senha` tipo nao declarado nos SQLs encontrados
- `role` tipo nao declarado nos SQLs encontrados
- `created_at` tipo nao declarado nos SQLs encontrados, mas aparece em edge function fora dos arquivos pedidos

Constraints explicitas encontradas:
- FK `usuarios_auth_user_id_fkey` -> `auth.users(id)` com `on delete cascade`
- Check `usuarios_role_check`
  Valores permitidos: `master`, `admin`, `tecnico`, `técnico`, `colaborador`, `runin_kiosk`
- Check `usuarios_setor_fixo_check`
  Quando `role = 'runin_kiosk'`, `setor_fixo` deve estar entre `Runin 01` e `Runin 10`

Indices explicitos encontrados:
- `usuarios_username_lower_key` unico em `lower(username)`
- `idx_usuarios_setor_fixo` em `(setor_fixo)`

RLS ativa:
- `ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY`
- Policy `usuarios_select_own`
  Permite `SELECT` do proprio perfil quando `auth.uid() = auth_user_id`.
- Policy `usuarios_select_admin_all`
  Permite `SELECT` para admin/master via `public.is_admin_or_master()`.
- Nao ha policies de `INSERT`, `UPDATE` e `DELETE` para cliente; comentario informa que isso fica em edge function com `service_role`.

Relacionamento com setor / Runin:
- `setor_fixo` modela o setor travado para perfis `runin_kiosk`.
- O dominio permitido explicitamente no check e `Runin 01` ate `Runin 10`.

4. public.avisos
Origem:
- `CREATE TABLE` e normalizacao em `supabase/DB_CANONICAL_SETUP.sql`.

Colunas explicitamente definidas no SQL:
- `id uuid default gen_random_uuid() primary key`
- `titulo text not null`
- `mensagem text not null`
- `autor text not null`
- `created_at timestamptz default now()`

Constraints explicitas encontradas:
- `primary key (id)`
- `titulo not null`
- `mensagem not null`
- `autor not null`

RLS ativa:
- `ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY`
- Policy `avisos_select_auth`
  Permite `SELECT` para qualquer usuario `authenticated`.
- Policy `avisos_insert_admin`
  Permite `INSERT` apenas quando `public.is_admin_or_master()` for verdadeiro.

5. Funcoes auxiliares usadas em RLS
- `public.is_admin_or_master()` retorna boolean e consulta `public.usuarios` pelo `auth.uid()`.
- `public.is_runin_kiosk()` retorna boolean e consulta `public.usuarios` pelo `auth.uid()`.
- `public.current_user_setor_fixo()` retorna `text` com o `setor_fixo` do usuario autenticado.

6. Tabelas prioritarias solicitadas por nome
- Tabelas com `ponto` no nome: nenhuma encontrada nos SQLs.
- Tabelas com `runin` ou `run_in` no nome: nenhuma encontrada nos SQLs.
- Tabelas com `avt` no nome: nenhuma encontrada nos SQLs.
- Tabelas com `setor` no nome: nenhuma encontrada nos SQLs.
- Tabelas com `trave` no nome: nenhuma encontrada nos SQLs.
- `registros_falhas`: encontrada e parcialmente documentada no SQL, com estrutura base incompleta no repositorio.
- `historico_concluidas`: nao encontrada no SQL; apenas inferida por uso no codigo.

=== supabaseSecure.js ===
Caminho completo: C:\Users\amanha\sistema-de-gestao\src\core\api\supabaseSecure.js

```js
﻿import { supabase } from './supabaseClient';
import { LISTA_SETORES } from '../../shared/constants/setores';
import { FALHAS_COMUNS } from '../../shared/constants/falhasComuns';
import { getSessionUser as getStoredSessionUser } from '../auth/session';
import {
  sanitizeString,
  validateUsername,
  validateSenha,
  validateSetor,
  validateTrave,
  validateFalhaTexto,
  validateSolucao,
  sanitizeFalhasArray,
  sanitizePontosArray,
  LIMITS,
} from '../validation/validation';
import { TOTAL_PONTOS_AVT, isTraveInteiraLabel } from '../../features/failures/constants/failureConstants';

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';

function normalizeDate(value) {
  const s = sanitizeString(value, 20);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  return null;
}

function getTimeZoneOffsetMinutes(timeZone, date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    minute: '2-digit',
  });
  const zonePart = formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value || 'GMT';
  const match = zonePart.match(/^GMT(?:(\+|-)(\d{1,2})(?::?(\d{2}))?)?$/i);
  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return sign * (hours * 60 + minutes);
}

function getBrazilDayStartUtcDate(dateKey) {
  const normalized = normalizeDate(dateKey);
  if (!normalized) return null;

  const [year, month, day] = normalized.split('-').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(BRAZIL_TIME_ZONE, probe);
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMinutes * 60 * 1000;
  const dt = new Date(utcMs);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function getLocalDayStartUtcIso(dateKey) {
  const dt = getBrazilDayStartUtcDate(dateKey);
  if (!dt) return null;
  return dt.toISOString();
}

function getNextLocalDayStartUtcIso(dateKey) {
  const dt = getBrazilDayStartUtcDate(dateKey);
  if (!dt) return null;
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString();
}

function toEpochMs(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;

  const onlyDate = normalizeDate(s);
  if (onlyDate) {
    const dt = getBrazilDayStartUtcDate(onlyDate);
    return dt ? dt.getTime() : null;
  }

  const dt = new Date(s.replace(' ', 'T'));
  if (!Number.isNaN(dt.getTime())) return dt.getTime();
  return null;
}

function getDateBounds(dataInicio, dataFim) {
  const inicio = dataInicio ? normalizeDate(dataInicio) : null;
  const fim = dataFim ? normalizeDate(dataFim) : null;
  const inicioIso = inicio ? getLocalDayStartUtcIso(inicio) : null;
  const fimExclusiveIso = fim ? getNextLocalDayStartUtcIso(fim) : null;
  const inicioMs = inicioIso ? toEpochMs(inicioIso) : null;
  const fimExclusiveMs = fimExclusiveIso ? toEpochMs(fimExclusiveIso) : null;

  return {
    inicio,
    fim,
    inicioIso,
    fimExclusiveIso,
    inicioMs,
    fimExclusiveMs,
  };
}

function isInRange(dateValue, inicioMs, fimExclusiveMs) {
  const timestamp = toEpochMs(dateValue);
  if (timestamp == null) return false;
  if (inicioMs != null && timestamp < inicioMs) return false;
  if (fimExclusiveMs != null && timestamp >= fimExclusiveMs) return false;
  return true;
}
function normalizeStatus(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeRole(value) {
  return String(value || '').trim().toLowerCase();
}

function isRuninKioskRole(value) {
  return normalizeRole(value) === 'runin_kiosk';
}

function isRestrictedMaintenanceRole(value) {
  const role = normalizeRole(value);
  return role === 'colaborador' || role === 'runin_kiosk';
}

function getSessionSetorFixo(sessionUser = null) {
  const setor = sanitizeString(sessionUser?.setor_fixo, 40).trim();
  if (!setor) return null;
  if (!validateSetor(setor, LISTA_SETORES)) return null;
  return setor;
}

function inferRuninSetorFromUsername(username) {
  const normalized = sanitizeString(username, LIMITS.MAX_USERNAME)
    .toLowerCase()
    .replace(/[\s._-]+/g, '');
  const match = normalized.match(/^runin0?([1-9]|10)$/);
  if (!match) return null;
  const runinNum = Number(match[1]);
  if (!Number.isInteger(runinNum) || runinNum < 1 || runinNum > 10) return null;
  return `Runin ${String(runinNum).padStart(2, '0')}`;
}

function isAvtSetor(value) {
  return /^AVT(\s|$)/i.test(String(value || '').trim());
}
function isConcludedRecord(item) {
  const status = normalizeStatus(item?.status);
  return status.includes('conclu');
}

function isOpenRecord(item) {
  const status = normalizeStatus(item?.status);
  return status.includes('aberto');
}

function splitFalhas(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeString(item, LIMITS.MAX_FALHA_TEXTO))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return sanitizeString(value, LIMITS.MAX_FALHA_TEXTO)
    .split(/[,+]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeFalhasSelecionadas(originais, selecionadas) {
  const counts = {};
  selecionadas.forEach((falha) => {
    counts[falha] = (counts[falha] || 0) + 1;
  });

  const restante = [];
  originais.forEach((falha) => {
    if (counts[falha] > 0) {
      counts[falha] -= 1;
      return;
    }
    restante.push(falha);
  });

  return restante;
}

const SIGA_SCHEMA_HINT = "Colunas SIGA nao encontradas em 'registros_falhas'. Execute a migracao de schema.";

function withSigaSchemaHint(error) {
  const message = String(error?.message || '');
  const isSigaColumnMissing = message.includes("Could not find the 'siga_")
    || message.includes('schema cache')
    || message.includes('siga_enviado')
    || message.includes('siga_status');

  if (!isSigaColumnMissing) return error;
  return { ...error, message: `${SIGA_SCHEMA_HINT} (${message})` };
}

export async function getUsuarioParaLogin(username, senha) {
  if (!validateUsername(username) || !validateSenha(senha)) {
    return { data: null, error: { message: 'Dados invalidos.' } };
  }

  const clean = sanitizeString(username, LIMITS.MAX_USERNAME).toLowerCase();
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, senha, role')
    .eq('username', clean)
    .maybeSingle();

  return { data, error };
}

export async function listarUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, role, setor_fixo')
    .order('username');

  return { data: data || [], error };
}

export async function atualizarSenhaUsuario(username, novaSenha) {
  const usernameLimpo = sanitizeString(username, LIMITS.MAX_USERNAME).trim();
  const usernameNormalizado = usernameLimpo.toLowerCase();
  const senhaLimpa = String(novaSenha || '');

  if (!usernameLimpo || !senhaLimpa) {
    return { success: false, error: { message: 'Dados invalidos para atualizar senha.' } };
  }

  try {
    const { data, error, count } = await supabase
      .from('usuarios')
      .update({ senha: senhaLimpa })
      .ilike('username', usernameNormalizado)
      .select('username', { count: 'exact' });

    if (error) return { success: false, error };
    if (typeof count === 'number' && count > 0) return { success: true };
    if (Array.isArray(data) && data.length > 0) return { success: true };

    return { success: false, error: { message: 'Nenhum usuario atualizado.' } };
  } catch (err) {
    return { success: false, error: { message: err?.message || 'Erro ao atualizar senha.' } };
  }
}

export async function criarUsuario(payload) {
  const user = getStoredSessionUser();
  const roleSolicitante = String(user?.role || '').toLowerCase();
  if (roleSolicitante !== 'admin' && roleSolicitante !== 'master') {
    return { data: null, error: { message: 'Nao autorizado.' } };
  }

  const username = sanitizeString(payload?.username, LIMITS.MAX_USERNAME).toLowerCase();
  const senha = String(payload?.senha ?? '').slice(0, LIMITS.MAX_SENHA);
  const inferredSetorFixo = inferRuninSetorFromUsername(username);
  const desiredRoleRaw = String(payload?.role || 'tecnico').toLowerCase();
  const desiredRole = inferredSetorFixo ? 'runin_kiosk' : desiredRoleRaw;
  const setorFixoInput = sanitizeString(payload?.setor_fixo, 40).trim();
  const setorFixo = inferredSetorFixo || setorFixoInput;

  const rolesPermitidas = roleSolicitante === 'master'
    ? ['master', 'admin', 'tecnico', 'técnico', 'tÃ©cnico', 'colaborador', 'runin_kiosk']
    : ['tecnico', 'técnico', 'tÃ©cnico', 'colaborador', 'runin_kiosk'];
  const roleNormalizada = desiredRole === 'técnico' || desiredRole === 'tÃ©cnico' ? 'tecnico' : desiredRole;
  const role = rolesPermitidas.includes(desiredRole) || rolesPermitidas.includes(roleNormalizada)
    ? roleNormalizada
    : 'tecnico';
  const setorFixoFinal = role === 'runin_kiosk' ? setorFixo : null;
  if (role === 'runin_kiosk' && !validateSetor(setorFixoFinal, LISTA_SETORES)) {
    return { data: null, error: { message: 'setor_fixo obrigatorio para Run In kiosk.' } };
  }

  if (!username || !senha) return { data: null, error: { message: 'Username e senha obrigatorios.' } };

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ username, senha, role, setor_fixo: setorFixoFinal }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: { message: err?.message || 'Erro ao criar usuario.' } };
  }
}

export async function removerUsuario(id) {
  const user = getStoredSessionUser();
  if (!user || user.role !== 'master') return { error: { message: 'Nao autorizado.' } };

  const idVal = Number(id);
  if (!Number.isInteger(idVal) && typeof id !== 'string') return { error: { message: 'ID invalido.' } };

  try {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao remover usuario.' } };
  }
}

export async function listarAvisos(limite = 50) {
  const limitSafe = Number.isInteger(limite) ? Math.min(Math.max(limite, 1), 200) : 50;
  const { data, error } = await supabase
    .from('avisos')
    .select('id, titulo, mensagem, autor, created_at')
    .order('created_at', { ascending: false })
    .limit(limitSafe);

  return { data: data || [], error };
}

export async function criarAviso(payload) {
  const user = getStoredSessionUser();
  const role = String(user?.role || '').toLowerCase();
  if (role !== 'master' && role !== 'admin') {
    return { data: null, error: { message: 'Nao autorizado.' } };
  }

  const titulo = sanitizeString(payload?.titulo, 120).trim();
  const mensagem = sanitizeString(payload?.mensagem, 1000).trim();
  if (!titulo || !mensagem) {
    return { data: null, error: { message: 'Titulo e mensagem obrigatorios.' } };
  }

  const autor = sanitizeString(user?.username, LIMITS.MAX_USERNAME) || 'Sistema';

  const { data, error } = await supabase
    .from('avisos')
    .insert([{ titulo, mensagem, autor }])
    .select()
    .single();

  return { data: data || null, error };
}
export async function listarFalhasAbertas() {
  const sessionUser = getStoredSessionUser();
  const setorFixo = getSessionSetorFixo(sessionUser);

  let query = supabase
    .from('registros_falhas')
    .select('*')
    .ilike('status', '%aberto%');
  if (isRuninKioskRole(sessionUser?.role) && setorFixo) {
    query = query.eq('setor', setorFixo);
  }

  const { data, error } = await query;

  return { data: data || [], error };
}

export async function listarChamadosAbertosPorSetor(setor) {
  const sessionUser = getStoredSessionUser();
  const setorFixo = getSessionSetorFixo(sessionUser);
  const setorAlvo = isRuninKioskRole(sessionUser?.role) ? setorFixo : String(setor || '').trim();
  if (!setorAlvo || !validateSetor(setorAlvo, LISTA_SETORES)) return { data: [], error: null };

  const { data, error } = await supabase
    .from('registros_falhas')
    .select('trave, ponto, falha')
    .eq('setor', setorAlvo)
    .ilike('status', '%aberto%')
    .not('trave', 'is', null)
    .not('ponto', 'is', null);

  return { data: data || [], error };
}

export async function listarRegistrosFalhas(filtroSetor = null) {
  let query = supabase.from('registros_falhas').select('falha');
  if (filtroSetor && filtroSetor !== 'TODOS' && validateSetor(filtroSetor, LISTA_SETORES)) {
    query = query.eq('setor', filtroSetor.trim());
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function listarRegistrosAbertos(dataInicio = null, dataFim = null) {
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);
  const selectBase = 'id, usuario, setor, trave, ponto, falha, data, status, resolvido_em';
  const selectWithInoperante = `${selectBase}, ponto_inoperante, inoperante_motivo, inoperante_observacao, inoperante_por, inoperante_em`;
  const selectWithSiga = `${selectWithInoperante}, siga_enviado, siga_status, siga_enviado_em, siga_codigo_chamado, siga_data_abertura, siga_finalizado_em`;

  const loadBySelect = async (selectCols) => {
    return supabase
      .from('registros_falhas')
      .select(selectCols)
      .ilike('status', '%aberto%')
      .order('data', { ascending: false });
  };

  let { data, error } = await loadBySelect(selectWithSiga);
  const maybeMissingOptionalColumns = String(error?.message || '').includes('siga_')
    || String(error?.message || '').includes('inoperante_');
  if (error && maybeMissingOptionalColumns) {
    const fallback = await loadBySelect(selectWithInoperante);
    data = fallback.data;
    error = fallback.error;
  }
  if (error && String(error?.message || '').includes('inoperante_')) {
    const fallback = await loadBySelect(selectBase);
    data = fallback.data;
    error = fallback.error;
  }
  if (error) return { data: [], error };

  const base = (data || []).filter((item) => isOpenRecord(item));
  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? base.filter((item) => isInRange(item?.data, inicioMs, fimExclusiveMs))
    : base;

  return { data: dataFiltrada, error: null };
}

export async function listarRegistrosInseridosNoSistema(dataInicio = null, dataFim = null) {
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);
  const { data, error } = await supabase
    .from('registros_falhas')
    .select('id, data')
    .order('data', { ascending: false });

  if (error) return { data: [], error };

  const base = Array.isArray(data) ? data : [];
  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? base.filter((item) => isInRange(item?.data, inicioMs, fimExclusiveMs))
    : base;

  return { data: dataFiltrada, error: null };
}

export async function listarRegistrosParaKPI(dataInicio = null, dataFim = null) {
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);

  let query = supabase
    .from('registros_falhas')
    .select('id, setor, status, falha, data, resolvido_em, usuario');

  const { data, error } = await query.order('data', { ascending: false });
  if (error) return { data: [], error };

  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? (data || []).filter((item) => {
        const referenciaTempo = isConcludedRecord(item) ? (item?.resolvido_em || item?.data) : item?.data;
        return isInRange(referenciaTempo, inicioMs, fimExclusiveMs);
      })
    : (data || []);

  return { data: dataFiltrada, error: null };
}

export async function listarOcorrenciasConcluidas(dataInicio = null, dataFim = null) {
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);
  const selectBase = 'id, usuario, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, status, data';
  const selectWithInoperante = `${selectBase}, ponto_inoperante, inoperante_motivo, inoperante_observacao, inoperante_por, inoperante_em`;
  const selectWithSiga = `${selectWithInoperante}, siga_enviado, siga_status, siga_enviado_em, siga_codigo_chamado, siga_data_abertura, siga_finalizado_em`;

  const loadBySelect = async (selectCols) => {
    return supabase
      .from('registros_falhas')
      .select(selectCols)
      .order('resolvido_em', { ascending: false });
  };

  let { data, error } = await loadBySelect(selectWithSiga);
  const maybeMissingOptionalColumns = String(error?.message || '').includes('siga_')
    || String(error?.message || '').includes('inoperante_');
  if (error && maybeMissingOptionalColumns) {
    const fallback = await loadBySelect(selectWithInoperante);
    data = fallback.data;
    error = fallback.error;
  }
  if (error && String(error?.message || '').includes('inoperante_')) {
    const fallback = await loadBySelect(selectBase);
    data = fallback.data;
    error = fallback.error;
  }
  if (error) return { data: [], error };

  const base = (data || []).filter((item) => isConcludedRecord(item));
  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? base.filter((item) => isInRange(item?.resolvido_em || item?.data, inicioMs, fimExclusiveMs))
    : base;

  return { data: dataFiltrada, error: null };
}

function pontoCorrespondeAoAlvo(pontoRegistro, pontoAlvo) {
  const registro = String(pontoRegistro || '').trim();
  const alvo = String(pontoAlvo || '').trim();
  if (!registro || !alvo) return false;

  const registroNorm = registro.toLowerCase();
  if (isTraveInteiraLabel(registroNorm)) return true;

  const alvoNum = alvo.match(/\d+/)?.[0];
  if (!alvoNum) return registroNorm === alvo.toLowerCase();

  const registroNum = registro.match(/\d+/)?.[0];
  return registroNum === alvoNum;
}

export async function listarHistoricoRecentePorPonto(setor, trave, ponto, limite = 5) {
  if (!validateSetor(setor, LISTA_SETORES)) return { data: [], error: null };
  if (!validateTrave(trave)) return { data: [], error: null };

  const setorSanit = String(setor).trim();
  const traveNum = Number(trave);
  const pontoSanit = sanitizeString(ponto, 50).trim();
  const limiteSeguro = Number.isInteger(limite) ? Math.max(1, Math.min(limite, 20)) : 5;

  const selectColsBase = 'id, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, usuario';
  const selectCols = `${selectColsBase}, ponto_inoperante, inoperante_motivo, inoperante_observacao, inoperante_por, inoperante_em`;

  try {
    let { data, error } = await supabase
      .from('historico_concluidas')
      .select(selectCols)
      .eq('setor', setorSanit)
      .eq('trave', traveNum)
      .order('resolvido_em', { ascending: false })
      .limit(60);

    if (error && String(error?.message || '').includes('inoperante_')) {
      const fallback = await supabase
        .from('historico_concluidas')
        .select(selectColsBase)
        .eq('setor', setorSanit)
        .eq('trave', traveNum)
        .order('resolvido_em', { ascending: false })
        .limit(60);
      data = fallback.data;
      error = fallback.error;
    }

    if (!error) {
      const filtrado = (data || [])
        .filter((item) => pontoCorrespondeAoAlvo(item?.ponto, pontoSanit))
        .slice(0, limiteSeguro);
      return { data: filtrado, error: null };
    }
  } catch {
    // fallback abaixo
  }

  let { data, error } = await supabase
    .from('registros_falhas')
    .select(selectCols)
    .eq('setor', setorSanit)
    .eq('trave', traveNum)
    .ilike('status', '%conclu%')
    .order('resolvido_em', { ascending: false })
    .limit(60);

  if (error && String(error?.message || '').includes('inoperante_')) {
    const fallback = await supabase
      .from('registros_falhas')
      .select(selectColsBase)
      .eq('setor', setorSanit)
      .eq('trave', traveNum)
      .ilike('status', '%conclu%')
      .order('resolvido_em', { ascending: false })
      .limit(60);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return { data: [], error };
  const filtrado = (data || [])
    .filter((item) => pontoCorrespondeAoAlvo(item?.ponto, pontoSanit))
    .slice(0, limiteSeguro);

  return { data: filtrado, error: null };
}

export async function inserirRegistrosFalha(setor, trave, pontos, falhas) {
  const sessionUser = getStoredSessionUser();
  const setorFixo = getSessionSetorFixo(sessionUser);
  const setorSanit = String(setor || '').trim();
  const setorAlvo = isRuninKioskRole(sessionUser?.role) ? setorFixo : setorSanit;
  if (!validateSetor(setorAlvo, LISTA_SETORES)) return { error: { message: 'Setor invalido.' } };
  if (isRuninKioskRole(sessionUser?.role) && setorFixo !== setorSanit) {
    return { error: { message: 'Usuario Run In pode registrar apenas no seu setor fixo.' } };
  }
  if (!validateTrave(trave)) return { error: { message: 'Trave invalida.' } };

  const falhasSanit = sanitizeFalhasArray(falhas, FALHAS_COMUNS);
  const pontosSanit = sanitizePontosArray(pontos);
  if (falhasSanit.length === 0 || pontosSanit.length === 0) {
    return { error: { message: 'Selecione ao menos um ponto e uma falha.' } };
  }

  const falhaTexto = falhasSanit.join(', ');
  if (!validateFalhaTexto(falhaTexto)) return { error: { message: 'Texto de falha invalido.' } };

  const username = sessionUser?.username || 'Tecnico';
  const traveNum = Number(trave);
  const totalPontos = isAvtSetor(setorAlvo) ? TOTAL_PONTOS_AVT : 15;
  const listaPontos = [...Array(totalPontos)].map((_, i) => i + 1);
  const todosPontos = listaPontos.length === pontosSanit.length;
  const inserts = todosPontos
    ? [{ usuario: username, setor: setorAlvo, trave: traveNum, ponto: `${listaPontos[0]}-${listaPontos[listaPontos.length - 1]} (Inteira)`, falha: falhaTexto, status: 'aberto' }]
    : pontosSanit.map((p) => ({
        usuario: username,
        setor: setorAlvo,
        trave: traveNum,
        ponto: `Ponto ${p}`,
        falha: falhaTexto,
        status: 'aberto',
      }));

  try {
    const { error } = await supabase.from('registros_falhas').insert(inserts);
    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao registrar falha.' } };
  }
}

export async function fecharRegistros(ids, solucao, falhasSelecionadas = null) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };
  if (!validateSolucao(solucao)) return { error: { message: 'Solucao invalida.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || isRestrictedMaintenanceRole(sessionUser.role)) {
    return { error: { message: 'Nao autorizado.' } };
  }

  const idList = ids.filter((id) => id != null && id !== '');
  if (idList.length === 0) return { error: { message: 'Nenhum ID valido.' } };
  const idSet = new Set(idList.map((id) => String(id)));
  const resolvidoPorSanit = sanitizeString(sessionUser.username, LIMITS.MAX_USERNAME) || 'Sistema';
  const solucaoSanit = sanitizeString(solucao, LIMITS.MAX_SOLUCAO);
  const resolvidoEmIso = new Date().toISOString();

  const selecaoValida = Array.isArray(falhasSelecionadas)
    ? falhasSelecionadas
        .map((item) => ({
          id: item?.id,
          falha: sanitizeString(item?.falha, LIMITS.MAX_FALHA_TEXTO).trim(),
        }))
        .filter((item) => item.id != null && item.id !== '' && item.falha)
        .filter((item) => idSet.has(String(item.id)))
    : [];

  if (selecaoValida.length === 0) {
    try {
      const { error } = await supabase
        .from('registros_falhas')
        .update({
          status: 'CONCLUIDO',
          solucao: solucaoSanit,
          resolvido_por: resolvidoPorSanit,
          resolvido_em: resolvidoEmIso,
        })
        .in('id', idList);

      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Erro ao fechar chamado.' } };
    }
  }

  try {
    const idsSelecao = [...new Set(selecaoValida.map((item) => item.id))];
    const idsConsulta = [...new Set([...idList, ...idsSelecao])];
    const { data: registros, error: errorFetch } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status')
      .in('id', idsConsulta);

    if (errorFetch) return { error: errorFetch };
    const rows = Array.isArray(registros) ? registros : [];
    if (rows.length === 0) return { error: { message: 'Nenhum registro encontrado para concluir.' } };

    const selecaoPorId = new Map();
    selecaoValida.forEach((item) => {
      const bucket = selecaoPorId.get(item.id) || [];
      bucket.push(item.falha);
      selecaoPorId.set(item.id, bucket);
    });

    for (const row of rows) {
      const falhasRow = splitFalhas(row?.falha);
      const falhasDesejadas = selecaoPorId.get(row.id) || [];
      if (falhasDesejadas.length === 0 || falhasRow.length === 0) continue;

      const setDesejadas = new Set(falhasDesejadas);
      const falhasResolvidas = falhasRow.filter((falha) => setDesejadas.has(falha));
      if (falhasResolvidas.length === 0) continue;

      const falhasRestantes = removeFalhasSelecionadas(falhasRow, falhasResolvidas);
      const falhasResolvidasTexto = falhasResolvidas.join(', ');

      if (falhasRestantes.length === 0) {
        const { error: errorUpdateConcluido } = await supabase
          .from('registros_falhas')
          .update({
            status: 'CONCLUIDO',
            falha: falhasResolvidasTexto,
            solucao: solucaoSanit,
            resolvido_por: resolvidoPorSanit,
            resolvido_em: resolvidoEmIso,
          })
          .eq('id', row.id);
        if (errorUpdateConcluido) return { error: errorUpdateConcluido };
        continue;
      }

      const { error: errorUpdateAberto } = await supabase
        .from('registros_falhas')
        .update({
          status: 'aberto',
          falha: falhasRestantes.join(', '),
          solucao: null,
          resolvido_por: null,
          resolvido_em: null,
        })
        .eq('id', row.id);
      if (errorUpdateAberto) return { error: errorUpdateAberto };

      const { error: errorInsertConcluido } = await supabase
        .from('registros_falhas')
        .insert([{
          usuario: row.usuario || 'Tecnico',
          setor: row.setor,
          trave: row.trave,
          ponto: row.ponto,
          falha: falhasResolvidasTexto,
          data: row.data,
          status: 'CONCLUIDO',
          solucao: solucaoSanit,
          resolvido_por: resolvidoPorSanit,
          resolvido_em: resolvidoEmIso,
        }]);
      if (errorInsertConcluido) return { error: errorInsertConcluido };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao fechar chamado.' } };
  }
}

export async function marcarFalhasComoInoperantes(ids, falhasSelecionadas = null, inoperantePayload = null) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || isRestrictedMaintenanceRole(sessionUser.role)) {
    return { error: { message: 'Nao autorizado.' } };
  }

  const idList = ids.filter((id) => id != null && id !== '');
  if (idList.length === 0) return { error: { message: 'Nenhum ID valido.' } };
  const idSet = new Set(idList.map((id) => String(id)));

  const motivosSelecionados = Array.isArray(inoperantePayload?.motivosSelecionados)
    ? inoperantePayload.motivosSelecionados.map((v) => sanitizeString(v, 160).trim()).filter(Boolean)
    : [];
  const descricao = sanitizeString(inoperantePayload?.descricao, 1000).trim();
  const motivoTexto = [...motivosSelecionados, descricao].filter(Boolean).join(' | ');
  const inoperantePor = sanitizeString(sessionUser?.username, LIMITS.MAX_USERNAME) || 'Sistema';
  const inoperanteEmIso = new Date().toISOString();

  const selecaoValida = Array.isArray(falhasSelecionadas)
    ? falhasSelecionadas
        .map((item) => ({
          id: item?.id,
          falha: sanitizeString(item?.falha, LIMITS.MAX_FALHA_TEXTO).trim(),
        }))
        .filter((item) => item.id != null && item.id !== '' && item.falha)
        .filter((item) => idSet.has(String(item.id)))
    : [];

  if (selecaoValida.length === 0) {
    try {
      const { error } = await supabase
        .from('registros_falhas')
        .update({
          ponto_inoperante: true,
          inoperante_motivo: motivoTexto || null,
          inoperante_observacao: descricao || null,
          inoperante_por: inoperantePor,
          inoperante_em: inoperanteEmIso,
        })
        .in('id', idList)
        .ilike('status', '%aberto%');

      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Erro ao marcar ponto inoperante.' } };
    }
  }

  try {
    const idsSelecao = [...new Set(selecaoValida.map((item) => item.id))];
    const idsConsulta = [...new Set([...idList, ...idsSelecao])];
    const { data: registros, error: errorFetch } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status, ponto_inoperante')
      .in('id', idsConsulta);

    if (errorFetch) return { error: errorFetch };
    const rows = Array.isArray(registros) ? registros : [];
    if (rows.length === 0) return { error: { message: 'Nenhum registro encontrado para atualizar.' } };

    const selecaoPorId = new Map();
    selecaoValida.forEach((item) => {
      const bucket = selecaoPorId.get(item.id) || [];
      bucket.push(item.falha);
      selecaoPorId.set(item.id, bucket);
    });

    for (const row of rows) {
      const falhasRow = splitFalhas(row?.falha);
      const falhasDesejadas = selecaoPorId.get(row.id) || [];
      if (falhasDesejadas.length === 0 || falhasRow.length === 0) continue;

      const setDesejadas = new Set(falhasDesejadas);
      const falhasInoperantes = falhasRow.filter((falha) => setDesejadas.has(falha));
      if (falhasInoperantes.length === 0) continue;

      const falhasRestantes = removeFalhasSelecionadas(falhasRow, falhasInoperantes);
      const falhasInoperantesTexto = falhasInoperantes.join(', ');

      if (falhasRestantes.length === 0) {
        const { error: errorUpdateInoperante } = await supabase
          .from('registros_falhas')
          .update({
            ponto_inoperante: true,
            falha: falhasInoperantesTexto,
            inoperante_motivo: motivoTexto || null,
            inoperante_observacao: descricao || null,
            inoperante_por: inoperantePor,
            inoperante_em: inoperanteEmIso,
          })
          .eq('id', row.id)
          .ilike('status', '%aberto%');
        if (errorUpdateInoperante) return { error: errorUpdateInoperante };
        continue;
      }

      const { error: errorUpdateAberto } = await supabase
        .from('registros_falhas')
        .update({
          falha: falhasRestantes.join(', '),
          ponto_inoperante: false,
          inoperante_motivo: null,
          inoperante_observacao: null,
          inoperante_por: null,
          inoperante_em: null,
        })
        .eq('id', row.id)
        .ilike('status', '%aberto%');
      if (errorUpdateAberto) return { error: errorUpdateAberto };

      const { error: errorInsertInoperante } = await supabase
        .from('registros_falhas')
        .insert([{
          usuario: row.usuario || 'Tecnico',
          setor: row.setor,
          trave: row.trave,
          ponto: row.ponto,
          falha: falhasInoperantesTexto,
          data: row.data,
          status: 'aberto',
          ponto_inoperante: true,
          inoperante_motivo: motivoTexto || null,
          inoperante_observacao: descricao || null,
          inoperante_por: inoperantePor,
          inoperante_em: inoperanteEmIso,
        }]);
      if (errorInsertInoperante) return { error: errorInsertInoperante };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao marcar ponto inoperante.' } };
  }
}

export async function atualizarFalhaInoperante({ id, data, falha, motivo }) {
  if (id == null || id === '') return { error: { message: 'ID obrigatorio.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || isRestrictedMaintenanceRole(sessionUser.role)) {
    return { error: { message: 'Nao autorizado.' } };
  }

  const payload = {};
  if (data) {
    const dt = new Date(data);
    if (Number.isNaN(dt.getTime())) return { error: { message: 'Data invalida.' } };
    payload.data = dt.toISOString();
  }

  const falhaSanit = sanitizeString(falha, LIMITS.MAX_FALHA_TEXTO).trim();
  if (falhaSanit) payload.falha = falhaSanit;

  if (motivo !== undefined) {
    const motivoSanit = sanitizeString(motivo, 1000).trim();
    payload.inoperante_motivo = motivoSanit || null;
    payload.inoperante_observacao = motivoSanit || null;
  }

  if (Object.keys(payload).length === 0) {
    return { error: { message: 'Nada para atualizar.' } };
  }

  const { error } = await supabase
    .from('registros_falhas')
    .update(payload)
    .eq('id', id)
    .eq('ponto_inoperante', true)
    .ilike('status', '%aberto%');

  return { error };
}

export async function reativarFalhasInoperantes(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || isRestrictedMaintenanceRole(sessionUser.role)) {
    return { error: { message: 'Nao autorizado.' } };
  }

  const idsValidos = [...new Set(ids.filter((id) => id != null && id !== ''))];
  if (idsValidos.length === 0) return { error: { message: 'Nenhum ID valido.' } };

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update({ ponto_inoperante: false })
      .in('id', idsValidos)
      .ilike('status', '%aberto%');

    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao reativar ponto inoperante.' } };
  }
}

export async function marcarFalhasParaSiga(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };

  const idsValidos = [...new Set(ids.filter((id) => id != null && id !== ''))];
  if (idsValidos.length === 0) return { error: { message: 'Nenhum ID valido.' } };

  const payload = {
    siga_enviado: true,
    siga_status: 'AGUARDANDO',
    siga_enviado_em: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update(payload)
      .in('id', idsValidos)
      .ilike('status', '%aberto%');

    return { error: withSigaSchemaHint(error) };
  } catch (err) {
    return { error: withSigaSchemaHint({ message: err?.message || 'Erro ao enviar para SIGA.' }) };
  }
}

export async function listarFalhasSigaAguardando() {
  try {
    const { data, error } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status, siga_status, siga_enviado, siga_enviado_em, siga_codigo_chamado, siga_data_abertura')
      .eq('siga_enviado', true)
      .ilike('status', '%aberto%')
      .order('data', { ascending: false });

    if (error) return { data: [], error: withSigaSchemaHint(error) };
    const aguardando = (data || []).filter((item) => String(item?.siga_status || 'AGUARDANDO').toUpperCase() !== 'FINALIZADO');
    return { data: aguardando, error: null };
  } catch (err) {
    return { data: [], error: withSigaSchemaHint({ message: err?.message || 'Erro ao listar SIGA (aguardando).' }) };
  }
}

export async function listarFalhasSigaFinalizados() {
  try {
    const { data, error } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status, solucao, resolvido_em, resolvido_por, siga_status, siga_enviado, siga_enviado_em, siga_codigo_chamado, siga_data_abertura, siga_finalizado_em')
      .eq('siga_enviado', true)
      .ilike('status', '%conclu%')
      .order('resolvido_em', { ascending: false });

    if (error) return { data: [], error: withSigaSchemaHint(error) };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: withSigaSchemaHint({ message: err?.message || 'Erro ao listar SIGA (finalizados).' }) };
  }
}

export async function finalizarFalhaViaSiga({ id, diaAbertura, codigoChamado }) {
  if (id == null || id === '') return { error: { message: 'ID obrigatorio.' } };
  const codigo = sanitizeString(codigoChamado, 120).trim();
  const dia = normalizeDate(diaAbertura);
  if (!codigo || !dia) return { error: { message: 'Dia da abertura e codigo do chamado sao obrigatorios.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || isRestrictedMaintenanceRole(sessionUser.role)) {
    return { error: { message: 'Nao autorizado.' } };
  }

  const resolvidoEmIso = new Date().toISOString();
  const resolvidoPorSanit = sanitizeString(sessionUser.username, LIMITS.MAX_USERNAME) || 'Sistema';
  const solucaoTexto = `Finalizado via SIGA - Chamado ${codigo}`;

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update({
        status: 'CONCLUIDO',
        solucao: solucaoTexto,
        resolvido_por: resolvidoPorSanit,
        resolvido_em: resolvidoEmIso,
        siga_status: 'FINALIZADO',
        siga_codigo_chamado: codigo,
        siga_data_abertura: dia,
        siga_finalizado_em: resolvidoEmIso,
      })
      .eq('id', id)
      .eq('siga_enviado', true);

    return { error: withSigaSchemaHint(error) };
  } catch (err) {
    return { error: withSigaSchemaHint({ message: err?.message || 'Erro ao finalizar falha via SIGA.' }) };
  }
}

export async function salvarDadosSigaAguardando({ id, diaAbertura, codigoChamado }) {
  if (id == null || id === '') return { error: { message: 'ID obrigatorio.' } };
  const codigo = sanitizeString(codigoChamado, 120).trim();
  const dia = normalizeDate(diaAbertura);
  if (!codigo || !dia) return { error: { message: 'Dia da abertura e codigo do chamado sao obrigatorios.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || isRestrictedMaintenanceRole(sessionUser.role)) {
    return { error: { message: 'Nao autorizado.' } };
  }

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update({
        siga_status: 'AGUARDANDO',
        siga_codigo_chamado: codigo,
        siga_data_abertura: dia,
      })
      .eq('id', id)
      .eq('siga_enviado', true)
      .ilike('status', '%aberto%');

    return { error: withSigaSchemaHint(error) };
  } catch (err) {
    return { error: withSigaSchemaHint({ message: err?.message || 'Erro ao salvar dados SIGA.' }) };
  }
}









```

=== useAIAssistant.js ===
Caminho completo: C:\Users\amanha\sistema-de-gestao\src\features\ai-assistant\hooks\useAIAssistant.js

```js
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { getSessionUser, isAdminUser } from '../../../core/auth/session';
import {
  listarAvisos,
  listarOcorrenciasConcluidas,
  listarRegistrosAbertos,
} from '../../../core/api/supabaseSecure';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { fetchDashboardDataset, computeDashboardMetrics } from '../../dashboard/services/dashboardAnalyticsService';
import { logoutUser } from '../../auth/services/authService';
import {
  createGeminiFunctionResponse,
  createGeminiTextEntry,
  generateAssistantTurn,
} from '../services/aiService';
import { normalizeToolArgs } from '../services/aiTools';

const QUICK_PROMPTS = [
  'Quais setores estao com mais falhas abertas hoje?',
  'Resuma os KPIs do periodo entre 2026-03-01 e 2026-03-07.',
  'Quais avisos ativos merecem atencao agora?',
];

function createUiMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

function clampLimit(value, fallback = 50, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

function matchesSetor(value, expected) {
  if (!expected) return true;
  return String(value || '').trim().toLowerCase() === String(expected || '').trim().toLowerCase();
}

function sortByLatestDate(items, fieldA, fieldB = null) {
  return [...items].sort((a, b) => {
    const valueB = new Date(b?.[fieldA] || (fieldB ? b?.[fieldB] : '') || 0).getTime();
    const valueA = new Date(a?.[fieldA] || (fieldB ? a?.[fieldB] : '') || 0).getTime();
    return valueB - valueA;
  });
}

async function queryHistoricoConcluidas(args = {}) {
  const limit = clampLimit(args.limit, 50, 100);
  const setor = args.setor ? String(args.setor).trim() : null;
  let query = supabase
    .from('historico_concluidas')
    .select('id, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, data')
    .order('resolvido_em', { ascending: false })
    .limit(limit);

  if (setor) {
    query = query.eq('setor', setor);
  }

  if (args.data_inicio) {
    query = query.gte('resolvido_em', `${args.data_inicio}T00:00:00`);
  }

  if (args.data_fim) {
    query = query.lte('resolvido_em', `${args.data_fim}T23:59:59.999`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    total: (data || []).length,
    filtros: { ...args, setor, limit },
    rows: (data || []).map((item) => ({
      id: item.id,
      setor: item.setor,
      trave: item.trave,
      ponto: item.ponto,
      falha: item.falha,
      solucao: item.solucao,
      resolvido_em: item.resolvido_em,
      resolvido_por: item.resolvido_por,
      data: item.data,
    })),
  };
}

export function useAIAssistant() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = usePersistentTheme();
  const user = getSessionUser() || { username: 'Usuario', role: 'colaborador' };
  const isAdmin = isAdminUser(user);

  const [messages, setMessages] = useState(() => [
    createUiMessage(
      'assistant',
      'Ola! Sou o assistente do sistema. Posso consultar falhas, gerar relatorios e responder perguntas sobre o sistema. Como posso ajudar?',
    ),
  ]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  const styles = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-500',
    card: theme === 'dark' ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200',
  }), [theme]);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    navigate('/', { replace: true });
  }, [navigate]);

  const navigateAndCloseMobile = useCallback((path) => {
    setMobileMenuOpen(false);
    navigate(path);
  }, [navigate]);

  const executeTool = useCallback(async (functionCall) => {
    const toolName = functionCall?.name;
    const args = normalizeToolArgs(functionCall?.args);

    switch (toolName) {
      case 'query_registros_falhas': {
        const limit = clampLimit(args.limit, 50, 100);
        const status = String(args.status || '').trim().toLowerCase();
        const setor = args.setor ? String(args.setor).trim() : null;

        if (status === 'aberto') {
          const { data, error } = await listarRegistrosAbertos(args.data_inicio || null, args.data_fim || null);
          if (error) throw error;
          const rows = (data || [])
            .filter((item) => matchesSetor(item?.setor, setor))
            .slice(0, limit)
            .map((item) => ({
              id: item.id,
              setor: item.setor,
              trave: item.trave,
              ponto: item.ponto,
              falha: item.falha,
              status: item.status,
              data: item.data,
              ponto_inoperante: Boolean(item?.ponto_inoperante),
            }));
          return { total: rows.length, filtros: { setor, status, limit }, rows };
        }

        if (status === 'concluido') {
          const { data, error } = await listarOcorrenciasConcluidas(args.data_inicio || null, args.data_fim || null);
          if (error) throw error;
          const rows = (data || [])
            .filter((item) => matchesSetor(item?.setor, setor))
            .slice(0, limit)
            .map((item) => ({
              id: item.id,
              setor: item.setor,
              trave: item.trave,
              ponto: item.ponto,
              falha: item.falha,
              status: item.status,
              resolvido_em: item.resolvido_em,
              resolvido_por: item.resolvido_por,
            }));
          return { total: rows.length, filtros: { setor, status, limit }, rows };
        }

        const [abertasRes, concluidasRes] = await Promise.all([
          listarRegistrosAbertos(args.data_inicio || null, args.data_fim || null),
          listarOcorrenciasConcluidas(args.data_inicio || null, args.data_fim || null),
        ]);
        if (abertasRes.error) throw abertasRes.error;
        if (concluidasRes.error) throw concluidasRes.error;

        const rows = sortByLatestDate([
          ...(abertasRes.data || []),
          ...(concluidasRes.data || []),
        ], 'resolvido_em', 'data')
          .filter((item) => matchesSetor(item?.setor, setor))
          .slice(0, limit)
          .map((item) => ({
            id: item.id,
            setor: item.setor,
            trave: item.trave,
            ponto: item.ponto,
            falha: item.falha,
            status: item.status,
            data: item.data,
            resolvido_em: item.resolvido_em || null,
          }));
        return { total: rows.length, filtros: { setor, status: status || 'todos', limit }, rows };
      }

      case 'query_avisos': {
        const limit = clampLimit(args.limit, 10, 20);
        const { data, error } = await listarAvisos(limit);
        if (error) throw error;
        const rows = (data || []).slice(0, limit).map((item) => ({
          id: item.id,
          titulo: item.titulo,
          mensagem: item.mensagem,
          autor: item.autor,
          created_at: item.created_at,
        }));
        return { total: rows.length, limit, rows };
      }

      case 'query_dashboard_kpis': {
        if (!args.data_inicio || !args.data_fim) {
          throw new Error('data_inicio e data_fim sao obrigatorios para query_dashboard_kpis.');
        }
        const dataset = await fetchDashboardDataset(args.data_inicio, args.data_fim);
        const setor = args.setor ? String(args.setor).trim() : null;
        const filterBySetor = (rows) => (
          setor ? rows.filter((item) => matchesSetor(item?.setor, setor)) : rows
        );

        const metrics = computeDashboardMetrics(
          filterBySetor(dataset.kpiRows || []),
          filterBySetor(dataset.concluidasRows || []),
          filterBySetor(dataset.abertasRows || []),
          filterBySetor(dataset.inseridosRows || []),
          new Date(),
          filterBySetor(dataset.abertasAtuaisRows || []),
        );

        return {
          periodo: {
            data_inicio: args.data_inicio,
            data_fim: args.data_fim,
            setor,
          },
          resumo: {
            totalGeral: metrics.totalGeral,
            totalPendentes: metrics.totalPendentes,
            totalConcluidas: metrics.totalConcluidas,
            chamadosInseridosNoSistema: metrics.chamadosInseridosNoSistema,
            conversionRate: Number(metrics.conversionRate?.toFixed?.(2) || 0),
          },
          topFalhas: (metrics.top5 || []).slice(0, 5),
          porSetor: (metrics.porSetor || []).slice(0, 10),
          sigaResumo: metrics.sigaResumo,
        };
      }

      case 'query_historico_concluidas': {
        try {
          return await queryHistoricoConcluidas(args);
        } catch {
          const limit = clampLimit(args.limit, 50, 100);
          const { data, error } = await listarOcorrenciasConcluidas(args.data_inicio || null, args.data_fim || null);
          if (error) throw error;
          const rows = (data || [])
            .filter((item) => matchesSetor(item?.setor, args.setor))
            .slice(0, limit)
            .map((item) => ({
              id: item.id,
              setor: item.setor,
              trave: item.trave,
              ponto: item.ponto,
              falha: item.falha,
              solucao: item.solucao,
              resolvido_em: item.resolvido_em,
              resolvido_por: item.resolvido_por,
            }));
          return { total: rows.length, filtros: { ...args, limit }, rows };
        }
      }

      default:
        throw new Error(`Tool nao suportada: ${toolName}`);
    }
  }, []);

  const sendMessage = useCallback(async (rawText) => {
    const text = String(rawText || '').trim();
    if (!text || loading) return;

    const nextUiUserMessage = createUiMessage('user', text);
    const nextHistory = [...history, createGeminiTextEntry('user', text)];

    setMessages((prev) => [...prev, nextUiUserMessage]);
    setHistory(nextHistory);
    setInput('');
    setLoading(true);

    try {
      let currentHistory = nextHistory;
      let finalText = '';

      for (let step = 0; step < 3; step += 1) {
        const turn = await generateAssistantTurn(currentHistory);
        currentHistory = [...currentHistory, turn.modelMessage];

        if (turn.functionCall?.name) {
          const toolResult = await executeTool(turn.functionCall);
          currentHistory = [
            ...currentHistory,
            createGeminiFunctionResponse(turn.functionCall.name, toolResult),
          ];
          continue;
        }

        finalText = turn.text || 'Nao encontrei dados suficientes para responder com seguranca.';
        break;
      }

      if (!finalText) {
        finalText = 'Consegui consultar os dados, mas nao recebi uma resposta final utilizavel do modelo.';
      }

      setHistory(currentHistory);
      setMessages((prev) => [...prev, createUiMessage('assistant', finalText)]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        createUiMessage('assistant', err?.message || 'Nao foi possivel consultar o assistente agora.'),
      ]);
    } finally {
      setLoading(false);
    }
  }, [executeTool, history, loading]);

  return {
    user,
    isAdmin,
    theme,
    toggleTheme,
    styles,
    messages,
    loading,
    input,
    setInput,
    sendMessage,
    quickPrompts: QUICK_PROMPTS,
    mobileMenuOpen,
    setMobileMenuOpen,
    navigateAndCloseMobile,
    navigate,
    handleLogout,
  };
}

```
