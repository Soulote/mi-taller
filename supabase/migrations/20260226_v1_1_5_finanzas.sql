alter table public.trabajos
  add column if not exists precio_cobrado numeric not null default 0,
  add column if not exists costo_materiales numeric not null default 0,
  add column if not exists costo_extra numeric not null default 0,
  add column if not exists fecha_entrega timestamptz null;

alter table public.trabajos
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_trabajos_fecha_entrega on public.trabajos (fecha_entrega desc);
create index if not exists idx_trabajos_estado_fecha_entrega on public.trabajos (estado, fecha_entrega desc);

alter table public.trabajos enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trabajos'
      and policyname = 'allow_anon_select_trabajos'
  ) then
    create policy "allow_anon_select_trabajos"
    on public.trabajos
    for select
    to anon
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trabajos'
      and policyname = 'allow_anon_insert_trabajos'
  ) then
    create policy "allow_anon_insert_trabajos"
    on public.trabajos
    for insert
    to anon
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trabajos'
      and policyname = 'allow_anon_update_trabajos'
  ) then
    create policy "allow_anon_update_trabajos"
    on public.trabajos
    for update
    to anon
    using (true)
    with check (true);
  end if;
end
$$;
