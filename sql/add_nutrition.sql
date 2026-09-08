create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calorie_goal integer not null default 2000 check (calorie_goal > 0),
  protein_goal integer not null default 120 check (protein_goal >= 0),
  carbs_goal integer not null default 250 check (carbs_goal >= 0),
  fat_goal integer not null default 55 check (fat_goal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  meal_type text not null check (meal_type in ('colazione', 'pranzo', 'cena', 'spuntino', 'fuori_pasto')),
  input_text text not null,
  transcript text,
  summary text not null,
  calories numeric not null check (calories >= 0),
  protein numeric not null check (protein >= 0),
  carbs numeric not null check (carbs >= 0),
  fat numeric not null check (fat >= 0),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 100)),
  source text not null default 'ai_import' check (source in ('ai_import', 'manual')),
  created_at timestamptz not null default now()
);

create index if not exists nutrition_meals_user_date_idx
  on public.nutrition_meals(user_id, date desc, created_at desc);

alter table public.nutrition_profiles
  drop column if exists openai_api_key;

alter table public.nutrition_profiles
  alter column calorie_goal set default 2000,
  alter column protein_goal set default 120,
  alter column carbs_goal set default 250,
  alter column fat_goal set default 55;

update public.nutrition_meals
set source = 'ai_import'
where source in ('text', 'voice');

alter table public.nutrition_meals
  alter column source set default 'ai_import';

alter table public.nutrition_meals
  drop constraint if exists nutrition_meals_source_check;

alter table public.nutrition_meals
  add constraint nutrition_meals_source_check
  check (source in ('ai_import', 'manual'));

alter table public.nutrition_profiles enable row level security;
alter table public.nutrition_meals enable row level security;

drop policy if exists nutrition_profiles_select on public.nutrition_profiles;
drop policy if exists nutrition_profiles_insert on public.nutrition_profiles;
drop policy if exists nutrition_profiles_update on public.nutrition_profiles;
drop policy if exists nutrition_profiles_delete on public.nutrition_profiles;

create policy nutrition_profiles_select
  on public.nutrition_profiles for select
  using (user_id = auth.uid());

create policy nutrition_profiles_insert
  on public.nutrition_profiles for insert
  with check (user_id = auth.uid());

create policy nutrition_profiles_update
  on public.nutrition_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy nutrition_profiles_delete
  on public.nutrition_profiles for delete
  using (user_id = auth.uid());

drop policy if exists nutrition_meals_select on public.nutrition_meals;
drop policy if exists nutrition_meals_insert on public.nutrition_meals;
drop policy if exists nutrition_meals_update on public.nutrition_meals;
drop policy if exists nutrition_meals_delete on public.nutrition_meals;

create policy nutrition_meals_select
  on public.nutrition_meals for select
  using (user_id = auth.uid());

create policy nutrition_meals_insert
  on public.nutrition_meals for insert
  with check (user_id = auth.uid());

create policy nutrition_meals_update
  on public.nutrition_meals for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy nutrition_meals_delete
  on public.nutrition_meals for delete
  using (user_id = auth.uid());
