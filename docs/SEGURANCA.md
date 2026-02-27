# Segurança — Lenovo Asset System

Este documento descreve as medidas de segurança do projeto e o que você precisa configurar no Supabase para proteger seus dados na Vercel.

## 1. O que já está protegido no código

- **Validação de entradas**: Todos os dados enviados ao banco passam por `src/lib/validation.js` (tamanhos máximos, caracteres inválidos, setores e falhas permitidas).
- **Camada segura**: Nenhuma página usa `supabase` direto para insert/update/delete. Tudo passa por `src/services/supabaseSecure.js`, que valida e sanitiza antes de escrever.
- **Remoção de usuário**: Só um ID por vez; exige confirmação e sessão de admin.
- **Fechamento de chamados**: Apenas por lista explícita de IDs e texto de solução validado.
- **Login**: Busca de usuário por username com sanitização; senha comparada no cliente (veja seção 4 sobre senhas).
- **Rotas protegidas**: `PrivateRoute` verifica `lenovo_user` no localStorage e redireciona se inválido.

**Importante:** No front-end (Vercel), a chave que vai no bundle é a anon key do Supabase. Ela é pública. A proteção real dos dados vem das políticas RLS (Row Level Security) no Supabase. Sem RLS, qualquer pessoa que inspecione o site pode usar essa chave para ler/escrever no banco.

## 2. Obrigatório: ativar RLS no Supabase

1. Acesse o Dashboard do Supabase, seu projeto.
2. Vá em Authentication / Policies ou Table Editor, selecione a tabela, RLS.
3. Ative Enable Row Level Security (RLS) nas tabelas `usuarios` e `registros_falhas`.

Depois, crie as políticas usando o arquivo `supabase/RLS_POLICIES.sql` na raiz do projeto. Execute esse SQL no Supabase (SQL Editor, New query, cole o conteúdo, Run).

As políticas sugeridas:
- **usuarios**: leitura permitida para login; insert/update/delete bloqueados para anon (evita criar/remover usuários pela API pública). Criação/remoção de usuários pode ser feita pelo Dashboard do Supabase ou por uma Edge Function com service role.
- **registros_falhas**: leitura permitida; insert permitido; update apenas para os campos de fechamento; delete bloqueado para anon.

Assim, mesmo que alguém tenha a anon key, não conseguirá apagar usuários nem apagar registros de falhas em massa.

## 3. Variáveis de ambiente (Vercel)

- Use apenas a anon (public) key do Supabase nas variáveis do projeto na Vercel.
- Nunca coloque a service_role key no front-end ou em variáveis expostas ao cliente.
- Configure no Vercel: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.

## 4. Senhas (recomendações)

Hoje o sistema compara senha em texto no cliente. Para produção ideal:
1. Migrar para Supabase Auth (supabase.auth.signInWithPassword) e tabela auth.users.
2. Se manter tabela usuarios: usar uma Edge Function para hash no cadastro e comparação no login; não armazenar senha em texto.

## 5. Resumo rápido

| Onde | O que fazer |
|------|-------------|
| Supabase Dashboard | Ativar RLS em usuarios e registros_falhas e rodar supabase/RLS_POLICIES.sql. |
| Vercel | Usar só VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. |
| Código | Já usa validação e supabaseSecure.js; não usar supabase direto para escrita. |
| Senhas (futuro) | Preferir Supabase Auth ou Edge Function com hash. |

Com RLS ativado e políticas aplicadas, o uso do app na Vercel fica muito mais seguro contra acesso e exclusão indevida dos seus dados.
