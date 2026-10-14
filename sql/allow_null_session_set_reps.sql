-- MAX is represented by NULL in session_sets.reps.
ALTER TABLE public.session_sets
  ALTER COLUMN reps DROP NOT NULL;
