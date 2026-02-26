create extension if not exists "pgcrypto";

create table if not exists public.clientes (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    telefono text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.equipos (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references public.clientes(id) on delete cascade,
    tipo text not null,
    marca_modelo text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1
        from pg_type
        where typname = 'job_status'
    ) then
        create type public.job_status as enum ('pendiente', 'en_curso', 'listo', 'entregado');
    end if;
end
$$;

create table if not exists public.trabajos (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references public.clientes(id) on delete cascade,
    equipo_id uuid not null references public.equipos(id) on delete cascade,
    estado public.job_status not null default 'pendiente',
    problema text not null,
    que_falta text not null default '',
    notas text not null default '',
    precio_cobrado numeric not null default 0,
    costo_materiales numeric not null default 0,
    costo_extra numeric not null default 0,
    fecha_entrega timestamptz,
    materiales_costo integer not null default 0,
    mano_obra integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_clientes_updated_at on public.clientes;
create trigger trg_clientes_updated_at
before update on public.clientes
for each row execute function public.set_updated_at();

drop trigger if exists trg_equipos_updated_at on public.equipos;
create trigger trg_equipos_updated_at
before update on public.equipos
for each row execute function public.set_updated_at();

drop trigger if exists trg_trabajos_updated_at on public.trabajos;
create trigger trg_trabajos_updated_at
before update on public.trabajos
for each row execute function public.set_updated_at();

create index if not exists idx_trabajos_estado on public.trabajos (estado);
create index if not exists idx_trabajos_updated_at on public.trabajos (updated_at desc);
create index if not exists idx_clientes_telefono on public.clientes (telefono);

alter table public.clientes enable row level security;
alter table public.equipos enable row level security;
alter table public.trabajos enable row level security;

drop policy if exists "allow_anon_select_clientes" on public.clientes;
create policy "allow_anon_select_clientes"
on public.clientes
for select
to anon
using (true);

drop policy if exists "allow_anon_insert_clientes" on public.clientes;
create policy "allow_anon_insert_clientes"
on public.clientes
for insert
to anon
with check (true);

drop policy if exists "allow_anon_update_clientes" on public.clientes;
create policy "allow_anon_update_clientes"
on public.clientes
for update
to anon
using (true)
with check (true);

drop policy if exists "allow_anon_select_equipos" on public.equipos;
create policy "allow_anon_select_equipos"
on public.equipos
for select
to anon
using (true);

drop policy if exists "allow_anon_insert_equipos" on public.equipos;
create policy "allow_anon_insert_equipos"
on public.equipos
for insert
to anon
with check (true);

drop policy if exists "allow_anon_update_equipos" on public.equipos;
create policy "allow_anon_update_equipos"
on public.equipos
for update
to anon
using (true)
with check (true);

drop policy if exists "allow_anon_select_trabajos" on public.trabajos;
create policy "allow_anon_select_trabajos"
on public.trabajos
for select
to anon
using (true);

drop policy if exists "allow_anon_insert_trabajos" on public.trabajos;
create policy "allow_anon_insert_trabajos"
on public.trabajos
for insert
to anon
with check (true);

drop policy if exists "allow_anon_update_trabajos" on public.trabajos;
create policy "allow_anon_update_trabajos"
on public.trabajos
for update
to anon
using (true)
with check (true);
