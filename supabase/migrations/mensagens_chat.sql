create table public.mensagens_chat (
  id uuid primary key default gen_random_uuid(),
  remetente_id uuid not null references auth.users(id) on delete cascade,
  destinatario_id uuid not null references auth.users(id) on delete cascade,
  conteudo text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now(),
  constraint mensagens_chat_remetente_destinatario_diferentes
    check (remetente_id <> destinatario_id)
);

create index on public.mensagens_chat (remetente_id, destinatario_id, created_at);
create index on public.mensagens_chat (destinatario_id, lida);

alter table public.mensagens_chat enable row level security;

create or replace function public.proteger_update_mensagens_chat()
returns trigger
language plpgsql
as $$
begin
  if old.remetente_id is distinct from new.remetente_id
     or old.destinatario_id is distinct from new.destinatario_id
     or old.conteudo is distinct from new.conteudo
     or old.created_at is distinct from new.created_at then
    raise exception 'Atualizacao invalida em mensagens_chat.';
  end if;

  if old.lida = true and new.lida = false then
    raise exception 'Nao e permitido desmarcar uma mensagem como lida.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_proteger_update_mensagens_chat on public.mensagens_chat;
create trigger trg_proteger_update_mensagens_chat
before update on public.mensagens_chat
for each row
execute function public.proteger_update_mensagens_chat();

-- Usuário vê mensagens onde é remetente ou destinatário
create policy "chat: ver próprias mensagens"
on public.mensagens_chat for select
to authenticated
using (auth.uid() = remetente_id or auth.uid() = destinatario_id);

-- Usuário envia mensagens onde é o remetente
create policy "chat: enviar mensagens"
on public.mensagens_chat for insert
to authenticated
with check (auth.uid() = remetente_id);

-- Usuário marca como lida apenas mensagens onde é o destinatário
create policy "chat: marcar como lida"
on public.mensagens_chat for update
to authenticated
using (auth.uid() = destinatario_id)
with check (auth.uid() = destinatario_id);

-- Limpeza automática de mensagens com mais de 7 dias (todo domingo às 3h)
-- Verifique se pg_cron está habilitado antes de executar esta linha
-- Supabase Dashboard → Database → Extensions → pg_cron
select cron.schedule(
  'limpar-mensagens-chat-antigas',
  '0 3 * * 0',
  $$delete from public.mensagens_chat where created_at < now() - interval '7 days'$$
);
