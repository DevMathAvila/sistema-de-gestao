# Seguranca - Lenovo Asset System

Este documento descreve as medidas de seguranca do projeto e o que precisa ser configurado no Supabase e na Vercel para proteger o ambiente de producao.

## 1. O que ja esta protegido no codigo

- **Validacao de entradas**: os dados enviados ao banco passam por `src/core/validation/validation.js`.
- **Camada segura**: as operacoes principais de leitura e escrita passam por `src/core/api/supabaseSecure.js`.
- **Criacao e exclusao de usuarios**: os fluxos administrativos usam Edge Functions e sessao autenticada.
- **Fechamento de chamados**: o fluxo exige IDs explicitos, permissao valida e texto de solucao validado.
- **Rotas protegidas**: `src/app/router/AppRouter.jsx` aplica guardas por sessao e role.

Importante: na Vercel, a chave enviada ao frontend e a `anon key` do Supabase. Ela e publica por natureza. A protecao real dos dados depende de `RLS` no Supabase.

## 2. Obrigatorio: ativar RLS no Supabase

1. Acesse o dashboard do Supabase.
2. Ative `Enable Row Level Security` nas tabelas `usuarios` e `registros_falhas`.
3. Execute o SQL de `supabase/RLS_POLICIES.sql`.

Politicas esperadas:

- `usuarios`: leitura controlada e operacoes administrativas protegidas.
- `registros_falhas`: leitura controlada, escrita e update limitados conforme role e regras de negocio.

## 3. Variaveis de ambiente

### Vercel

Configure no projeto da Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `PROJECT_CONTEXT_SUMMARY`

### Supabase Edge Functions Secrets

Configure no projeto Supabase:

- `SUPABASE_URL`
- `SERVICE_ROLE_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`

Nunca exponha `SERVICE_ROLE_KEY` no frontend ou em variaveis `VITE_*`.

## 4. Senhas

O fluxo ativo usa `Supabase Auth`. A tabela `public.usuarios` guarda o perfil operacional e metadados como role, `auth_user_id`, `force_password_change` e `setor_fixo`.

Se ainda existir alguma coluna `senha` residual no banco por historico de migracao, trate-a como legado e remova quando a migracao estiver concluida.

## 5. Resumo rapido

| Onde | O que fazer |
|------|-------------|
| Supabase Dashboard | Ativar RLS e aplicar `supabase/RLS_POLICIES.sql`. |
| Vercel | Configurar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `PROJECT_CONTEXT_SUMMARY`. |
| Supabase Functions Secrets | Configurar `SUPABASE_URL` e `SERVICE_ROLE_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`. |
| Codigo | Centralizar escrita em `src/core/api/supabaseSecure.js` e validacao em `src/core/validation/validation.js`. |
