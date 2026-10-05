-- =====================================================================
-- Redentor Meridional — 0001: contribuintes, contribuições, painel
-- =====================================================================
--
-- Toda tabela, função e política leva o prefixo `redentor_`: se o projeto
-- Supabase for compartilhado com outros clientes do MA24, nada colide.
--
-- Vocabulário (CLAUDE.md): nunca "assinatura". A cobrança mensal do Asaas
-- (subscription) é uma "contribuição recorrente" (redentor_recorrentes).
--
-- Dinheiro em centavos (integer), nunca float. Status e datas vêm do Asaas
-- pelo webhook; o site nunca marca nada como pago sozinho.
--
-- LGPD: o CPF vai só para o Asaas e NÃO é guardado aqui. Cada contribuição
-- registra quando e qual versão da política foi aceita.
-- =====================================================================

create table if not exists public.redentor_config (
  id                smallint primary key default 1 check (id = 1),
  nome_exibicao     text not null default 'Redentor Meridional',
  telefone_whatsapp text not null default '5551991100476',
  atualizado_em     timestamptz not null default now()
);
-- NÃO APAGAR esta linha ao limpar testes: /api/saude lê dela.
insert into public.redentor_config (id) values (1) on conflict (id) do nothing;

-- Quem entra no painel. Estar logado não basta.
create table if not exists public.redentor_staff (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  nome      text,
  criado_em timestamptz not null default now()
);

create table if not exists public.redentor_contribuintes (
  id                 uuid primary key default gen_random_uuid(),
  asaas_customer_id  text unique,
  nome               text not null,
  email              text,
  telefone           text,
  criado_em          timestamptz not null default now()
);
create index if not exists redentor_contribuintes_email_idx on public.redentor_contribuintes (lower(email));

-- Contribuição recorrente mensal = subscription no Asaas. Cada mês nasce uma
-- linha em redentor_contribuicoes apontando para ela.
create table if not exists public.redentor_recorrentes (
  id                     uuid primary key default gen_random_uuid(),
  contribuinte_id        uuid not null references public.redentor_contribuintes (id),
  asaas_subscription_id  text unique,
  valor_centavos         integer not null check (valor_centavos > 0),
  forma                  text not null check (forma in ('pix', 'cartao')),
  status                 text not null default 'ativa' check (status in ('ativa', 'cancelada')),
  criado_em              timestamptz not null default now(),
  cancelado_em           timestamptz
);
create index if not exists redentor_recorrentes_status_idx on public.redentor_recorrentes (status, criado_em desc);

create table if not exists public.redentor_contribuicoes (
  id                 uuid primary key default gen_random_uuid(),
  contribuinte_id    uuid not null references public.redentor_contribuintes (id),
  recorrente_id      uuid references public.redentor_recorrentes (id),
  tipo               text not null check (tipo in ('recorrente', 'unica')),
  forma              text not null check (forma in ('pix', 'cartao')),
  valor_centavos     integer not null check (valor_centavos > 0),
  -- Bruto menos líquido da organização (tarifa do Asaas + split do MA24), pelo webhook.
  repasse_centavos   integer,
  status             text not null default 'pendente'
                     check (status in ('pendente', 'pago', 'vencido', 'cancelado', 'estornado')),
  asaas_payment_id   text unique,
  referencia         text unique,            -- externalReference mandada ao Asaas
  pago_em            timestamptz,
  consentimento_em   timestamptz,
  politica_versao    text,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);
create index if not exists redentor_contribuicoes_recentes_idx on public.redentor_contribuicoes (criado_em desc);
create index if not exists redentor_contribuicoes_status_idx on public.redentor_contribuicoes (status, pago_em desc);

-- Todo evento do webhook, pelo id do Asaas: impede processar duas vezes (o
-- Asaas reenvia) e responde "o que aconteceu com esta contribuição?".
create table if not exists public.redentor_asaas_eventos (
  id          text primary key,
  tipo        text not null,
  payment_id  text,
  payload     jsonb not null,
  recebido_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- RLS: o painel lê, ninguém escreve pelo navegador. Escrita só pela
-- service_role nas rotas do servidor (app/api/**).
-- ---------------------------------------------------------------------
alter table public.redentor_config        enable row level security;
alter table public.redentor_staff         enable row level security;
alter table public.redentor_contribuintes enable row level security;
alter table public.redentor_recorrentes   enable row level security;
alter table public.redentor_contribuicoes enable row level security;
alter table public.redentor_asaas_eventos enable row level security;

create or replace function public.redentor_e_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.redentor_staff where user_id = auth.uid());
$$;

drop policy if exists redentor_config_publica on public.redentor_config;
create policy redentor_config_publica on public.redentor_config for select using (true);

drop policy if exists redentor_staff_propria on public.redentor_staff;
create policy redentor_staff_propria on public.redentor_staff for select to authenticated using (user_id = auth.uid());

drop policy if exists redentor_contribuintes_staff on public.redentor_contribuintes;
create policy redentor_contribuintes_staff on public.redentor_contribuintes for select to authenticated using (public.redentor_e_staff());

drop policy if exists redentor_recorrentes_staff on public.redentor_recorrentes;
create policy redentor_recorrentes_staff on public.redentor_recorrentes for select to authenticated using (public.redentor_e_staff());

drop policy if exists redentor_contribuicoes_staff on public.redentor_contribuicoes;
create policy redentor_contribuicoes_staff on public.redentor_contribuicoes for select to authenticated using (public.redentor_e_staff());
-- redentor_asaas_eventos: sem política. Só service_role.
