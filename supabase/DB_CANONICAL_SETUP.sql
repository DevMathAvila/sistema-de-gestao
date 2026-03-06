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
  add column if not exists force_password_change boolean default true;

create unique index if not exists usuarios_username_lower_key
  on public.usuarios (lower(username));

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
check (role in ('master', 'admin', 'tecnico', 'técnico', 'colaborador'));

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

revoke all on function public.is_admin_or_master() from public;
grant execute on function public.is_admin_or_master() to authenticated;

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
using (true);

create policy registros_falhas_insert_auth
on public.registros_falhas
for insert
to authenticated
with check (true);

create policy registros_falhas_update_auth
on public.registros_falhas
for update
to authenticated
using (true)
with check (true);

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
