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

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS news_seen_version text;

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
