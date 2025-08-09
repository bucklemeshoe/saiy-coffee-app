create extension if not exists postgis;

create table if not exists public.users (
  id uuid primary key,
  email text,
  name text,
  phone text,
  dietary_prefs text,
  created_at timestamptz default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  items jsonb not null,
  status text not null check (status in ('pending','preparing','ready','collected','cancelled')) default 'pending',
  pickup_time timestamptz not null,
  share_location boolean not null default false,
  current_location geography(Point, 4326),
  created_at timestamptz default now()
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor text not null,
  event text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

-- Policies
drop policy if exists "users read own profile" on public.users;
create policy "users read own profile"
on public.users for select using (id = auth.uid());

drop policy if exists "orders select own" on public.orders;
create policy "orders select own"
on public.orders for select using (user_id = auth.uid());

drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own"
on public.orders for insert with check (user_id = auth.uid());

-- Menu is public readable
drop policy if exists "menu public read" on public.menu_items;
create policy "menu public read"
on public.menu_items for select using (true);

