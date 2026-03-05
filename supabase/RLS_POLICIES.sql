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
