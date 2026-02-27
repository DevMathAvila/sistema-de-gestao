-- =============================================================================
-- RLS (Row Level Security) — Lenovo Asset System
-- Execute no Supabase: SQL Editor → New query → Cole este conteúdo → Run
-- =============================================================================
-- Isso impede que qualquer pessoa com a anon key apague ou altere dados
-- de forma indevida. A aplicação continua usando a anon key no front-end.
-- =============================================================================

-- 1) TABELA: usuarios
-- Habilitar RLS
ALTER TABLE IF EXISTS public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: permitir SELECT para qualquer um (necessário para o login)
CREATE POLICY "usuarios_select_anon"
  ON public.usuarios FOR SELECT
  TO anon
  USING (true);

-- Política: permitir INSERT apenas para usuários autenticados (opcional: restringir depois com Supabase Auth)
-- Por enquanto permitimos INSERT para o app admin funcionar; para travar criação de usuários pela API pública, use a política comentada abaixo.
CREATE POLICY "usuarios_insert_anon"
  ON public.usuarios FOR INSERT
  TO anon
  WITH CHECK (true);

-- Bloquear UPDATE para anon (evita alteração de senha/role em massa pela API pública)
DROP POLICY IF EXISTS "usuarios_update_anon" ON public.usuarios;
CREATE POLICY "usuarios_deny_update_anon"
  ON public.usuarios FOR UPDATE
  TO anon
  USING (false);

-- DELETE: permitido para anon para o painel Admin (Remover usuário) funcionar.
-- Para máxima segurança (só remover usuários pelo Dashboard ou Edge Function),
-- comente o bloco abaixo e remova a política usuarios_delete_anon.
DROP POLICY IF EXISTS "usuarios_deny_delete_anon" ON public.usuarios;
CREATE POLICY "usuarios_delete_anon"
  ON public.usuarios FOR DELETE
  TO anon
  USING (true);

-- Se preferir que NINGUÉM crie usuário pela anon key (só pelo Dashboard ou Edge Function), descomente:
-- DROP POLICY IF EXISTS "usuarios_insert_anon" ON public.usuarios;
-- Depois crie usuários apenas pelo Supabase Dashboard ou por uma Edge Function com service_role.


-- 2) TABELA: registros_falhas
ALTER TABLE IF EXISTS public.registros_falhas ENABLE ROW LEVEL SECURITY;

-- SELECT: permitir leitura para o app (dashboard, monitor, visualizar)
CREATE POLICY "registros_falhas_select_anon"
  ON public.registros_falhas FOR SELECT
  TO anon
  USING (true);

-- INSERT: permitir para técnicos registrarem falhas
CREATE POLICY "registros_falhas_insert_anon"
  ON public.registros_falhas FOR INSERT
  TO anon
  WITH CHECK (true);

-- UPDATE: permitir para fechar chamados (status, solucao, etc.)
CREATE POLICY "registros_falhas_update_anon"
  ON public.registros_falhas FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- DELETE: BLOQUEAR para anon — ninguém apaga registros pela aplicação pública
DROP POLICY IF EXISTS "registros_falhas_delete_anon" ON public.registros_falhas;
CREATE POLICY "registros_falhas_deny_delete_anon"
  ON public.registros_falhas FOR DELETE
  TO anon
  USING (false);

-- =============================================================================
-- Após executar, teste o app: login, registrar falha, fechar chamado, admin.
-- Se algo deixar de funcionar, verifique as políticas no Dashboard (Table → RLS).
-- =============================================================================
