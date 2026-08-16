-- Rasson MultiBrand VMS - Supabase device table

create table if not exists public.devices (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    brand text not null default 'generic',
    type text not null default 'dvr',
    connection_type text not null default 'IP',
    serial text default '',
    ip text default '',
    port text default '',
    username text default '',
    password text default '',
    channels integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists devices_created_at_idx
    on public.devices (created_at);

alter table public.devices enable row level security;

-- No public RLS policy is created.
-- The VMS backend uses the Supabase service-role key server-side.
