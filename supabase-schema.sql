-- MSL Trading Journal v8 cloud schema
-- Run this once in your Supabase SQL editor.
create table if not exists public.trades (
  id uuid primary key,
  created bigint not null,
  date timestamptz not null,
  pair text not null,
  direction text not null,
  session text,
  setup text,
  liquidity text,
  confirmation text,
  zone text,
  entry numeric,
  stop numeric,
  target numeric,
  result text,
  r numeric default 0,
  reason text,
  review text,
  screenshot text
);

alter table public.trades enable row level security;

-- This starter schema is intentionally not opened to anonymous writes.
-- For a real multi-device account system, add Supabase Auth and policies
-- scoped to auth.uid(). Do NOT use the service-role key in the PWA.
