-- Run this in the Supabase SQL editor

-- Muscle groups (global, read-only for users)
create table if not exists muscle_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Exercises
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  equipment text,
  notes text,
  created_at timestamptz default now()
);

-- Exercise <-> muscle group bridge
create table if not exists exercise_muscles (
  exercise_id uuid references exercises(id) on delete cascade,
  muscle_group_id uuid references muscle_groups(id) on delete cascade,
  role text not null check (role in ('primary', 'secondary')),
  primary key (exercise_id, muscle_group_id)
);

-- Workout templates
create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null
);

-- Exercises inside a template
create table if not exists template_exercises (
  template_id uuid references workout_templates(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  target_sets int not null default 3,
  target_reps int not null default 10,
  position int not null default 0,
  primary key (template_id, exercise_id)
);

-- Workout sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  template_id uuid references workout_templates(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

-- The core tracking rows
create table if not exists session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number int not null,
  weight numeric(6,2) not null default 0,
  reps int not null,
  rpe numeric(3,1),
  created_at timestamptz default now()
);

-- RLS
alter table exercises enable row level security;
alter table exercise_muscles enable row level security;
alter table workout_templates enable row level security;
alter table template_exercises enable row level security;
alter table sessions enable row level security;
alter table session_sets enable row level security;

-- Policies: exercises (global or own)
create policy "exercises_select" on exercises for select using (user_id is null or user_id = auth.uid());
create policy "exercises_insert" on exercises for insert with check (user_id = auth.uid());
create policy "exercises_update" on exercises for update using (user_id = auth.uid());
create policy "exercises_delete" on exercises for delete using (user_id = auth.uid());

-- exercise_muscles (follow parent exercise)
create policy "exercise_muscles_select" on exercise_muscles for select using (
  exists (select 1 from exercises e where e.id = exercise_id and (e.user_id is null or e.user_id = auth.uid()))
);
create policy "exercise_muscles_insert" on exercise_muscles for insert with check (
  exists (select 1 from exercises e where e.id = exercise_id and e.user_id = auth.uid())
);
create policy "exercise_muscles_delete" on exercise_muscles for delete using (
  exists (select 1 from exercises e where e.id = exercise_id and e.user_id = auth.uid())
);

-- workout_templates
create policy "templates_select" on workout_templates for select using (user_id = auth.uid());
create policy "templates_insert" on workout_templates for insert with check (user_id = auth.uid());
create policy "templates_update" on workout_templates for update using (user_id = auth.uid());
create policy "templates_delete" on workout_templates for delete using (user_id = auth.uid());

-- template_exercises
create policy "template_exercises_select" on template_exercises for select using (
  exists (select 1 from workout_templates t where t.id = template_id and t.user_id = auth.uid())
);
create policy "template_exercises_insert" on template_exercises for insert with check (
  exists (select 1 from workout_templates t where t.id = template_id and t.user_id = auth.uid())
);
create policy "template_exercises_delete" on template_exercises for delete using (
  exists (select 1 from workout_templates t where t.id = template_id and t.user_id = auth.uid())
);

-- sessions
create policy "sessions_select" on sessions for select using (user_id = auth.uid());
create policy "sessions_insert" on sessions for insert with check (user_id = auth.uid());
create policy "sessions_update" on sessions for update using (user_id = auth.uid());
create policy "sessions_delete" on sessions for delete using (user_id = auth.uid());

-- session_sets
create policy "session_sets_select" on session_sets for select using (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "session_sets_insert" on session_sets for insert with check (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "session_sets_update" on session_sets for update using (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "session_sets_delete" on session_sets for delete using (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);

-- muscle_groups is public read
alter table muscle_groups enable row level security;
create policy "muscle_groups_select" on muscle_groups for select using (true);

-- SEED: muscle groups
insert into muscle_groups (name) values
  ('Petto'), ('Dorso'), ('Spalle'), ('Bicipiti'), ('Tricipiti'),
  ('Quadricipiti'), ('Femorali'), ('Glutei'), ('Core'), ('Polpacci'), ('Avambracci')
on conflict (name) do nothing;

-- SEED: global exercises (user_id null)
insert into exercises (name, equipment, user_id) values
  ('Panca Piana', 'Bilanciere', null),
  ('Panca Inclinata', 'Bilanciere', null),
  ('Panca Declinata', 'Bilanciere', null),
  ('Croci Piana', 'Manubri', null),
  ('Push-up', 'Corpo libero', null),
  ('Squat', 'Bilanciere', null),
  ('Leg Press', 'Macchinario', null),
  ('Affondi', 'Manubri', null),
  ('Leg Extension', 'Macchinario', null),
  ('Leg Curl', 'Macchinario', null),
  ('Stacco da Terra', 'Bilanciere', null),
  ('Romanian Deadlift', 'Bilanciere', null),
  ('Hip Thrust', 'Bilanciere', null),
  ('Trazioni', 'Sbarra', null),
  ('Lat Machine', 'Macchinario', null),
  ('Rematore con Bilanciere', 'Bilanciere', null),
  ('Rematore con Manubrio', 'Manubrio', null),
  ('Military Press', 'Bilanciere', null),
  ('Lento Avanti con Manubri', 'Manubri', null),
  ('Alzate Laterali', 'Manubri', null),
  ('Curl con Bilanciere', 'Bilanciere', null),
  ('Curl con Manubri', 'Manubri', null),
  ('Hammer Curl', 'Manubri', null),
  ('Tricipiti ai Cavi', 'Cavi', null),
  ('French Press', 'Bilanciere', null),
  ('Dip alle Parallele', 'Corpo libero', null),
  ('Plank', 'Corpo libero', null),
  ('Crunch', 'Corpo libero', null),
  ('Calf Raise', 'Macchinario', null)
on conflict do nothing;
