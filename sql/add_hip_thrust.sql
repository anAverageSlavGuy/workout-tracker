-- ============================================================
-- Add Hip Thrust exercise (bodyweight)
-- ============================================================

-- 1. Insert Hip Thrust into exercises table
INSERT INTO "public"."exercises" ("id", "name", "equipment_id", "notes", "user_id", "created_at")
VALUES (
  '5a2a94b8-404e-497f-be8b-7acb61b81705',
  'Hip Thrust',
  NULL,
  'Corpo libero',
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert muscle group activations for Hip Thrust
INSERT INTO "public"."exercise_muscles" ("exercise_id", "muscle_group_id", "activation_percentage")
VALUES
  ('5a2a94b8-404e-497f-be8b-7acb61b81705', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', '90.00'), -- Glutei (primario)
  ('5a2a94b8-404e-497f-be8b-7acb61b81705', '963fba48-53da-4240-99aa-51aec8d6bed9', '35.00')  -- Femorali (secondario)
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- 3. Verify the insertion
SELECT
  e.id,
  e.name,
  em.muscle_group_id,
  mg.name as muscle_group,
  em.activation_percentage
FROM exercises e
LEFT JOIN exercise_muscles em ON e.id = em.exercise_id
LEFT JOIN muscle_groups mg ON em.muscle_group_id = mg.id
WHERE e.id = '5a2a94b8-404e-497f-be8b-7acb61b81705'
ORDER BY em.activation_percentage DESC;
