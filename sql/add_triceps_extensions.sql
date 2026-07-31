-- ============================================================
-- Add Triceps Extensions exercise (bodyweight)
-- ============================================================

-- 1. Insert Triceps Extensions into exercises table
INSERT INTO "public"."exercises" ("id", "name", "equipment_id", "notes", "user_id", "created_at")
VALUES (
  '8d5e9f6a-0b3c-4d2e-c4f8-9a7b3f2d0e5c',
  'Triceps Extensions',
  NULL,
  'Corpo libero',
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert muscle group activations for Triceps Extensions
INSERT INTO "public"."exercise_muscles" ("exercise_id", "muscle_group_id", "activation_percentage")
VALUES
  ('8d5e9f6a-0b3c-4d2e-c4f8-9a7b3f2d0e5c', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', '88.00'), -- Tricipiti (primario)
  ('8d5e9f6a-0b3c-4d2e-c4f8-9a7b3f2d0e5c', '13b8f372-6501-4539-951b-284fef927bc1', '22.00'), -- Spalle (secondario)
  ('8d5e9f6a-0b3c-4d2e-c4f8-9a7b3f2d0e5c', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', '18.00')  -- Avambracci (stabilizzazione)
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
WHERE e.id = '8d5e9f6a-0b3c-4d2e-c4f8-9a7b3f2d0e5c'
ORDER BY em.activation_percentage DESC;
