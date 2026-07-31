-- ============================================================
-- Add Sissi Squat exercise (bodyweight)
-- ============================================================

-- 1. Insert Sissi Squat into exercises table
INSERT INTO "public"."exercises" ("id", "name", "equipment_id", "notes", "user_id", "created_at")
VALUES (
  '7c4d8e5f-9a2b-4c1d-b3e7-8f6a2e1c9d4b',
  'Sissi Squat',
  NULL,
  'Corpo libero',
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert muscle group activations for Sissi Squat
INSERT INTO "public"."exercise_muscles" ("exercise_id", "muscle_group_id", "activation_percentage")
VALUES
  ('7c4d8e5f-9a2b-4c1d-b3e7-8f6a2e1c9d4b', '67f07249-c145-43a7-a1be-d2a6227b283c', '95.00'), -- Quadricipiti (primario)
  ('7c4d8e5f-9a2b-4c1d-b3e7-8f6a2e1c9d4b', '963fba48-53da-4240-99aa-51aec8d6bed9', '20.00'), -- Femorali (secondario)
  ('7c4d8e5f-9a2b-4c1d-b3e7-8f6a2e1c9d4b', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', '10.00')  -- Glutei (stabilizzazione)
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
WHERE e.id = '7c4d8e5f-9a2b-4c1d-b3e7-8f6a2e1c9d4b'
ORDER BY em.activation_percentage DESC;
