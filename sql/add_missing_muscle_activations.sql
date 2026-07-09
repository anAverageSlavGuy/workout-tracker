-- Fix: Add missing muscle activations
-- This script adds the secondary muscles that didn't get added in the first migration

-- Chest press: add Spalle (20%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 20, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Chest press' AND m.name = 'Spalle'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Croci: add Tricipiti (15%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 15, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Croci' AND m.name = 'Tricipiti'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Dips: add Spalle (25%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 25, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Dips' AND m.name = 'Spalle'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Lento avanti: add Avambracci (20%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 20, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Lento avanti' AND m.name = 'Avambracci'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Military press: add Avambracci (20%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 20, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Military press' AND m.name = 'Avambracci'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Pressa: fix Avambracci (25%)
UPDATE exercise_muscles SET activation_percentage = 25
WHERE exercise_id = (SELECT id FROM exercises WHERE name = 'Pressa')
AND muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Avambracci');

-- Pressa: add or fix Glutei (45%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 45, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Pressa' AND m.name = 'Glutei'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
)
ON CONFLICT (exercise_id, muscle_group_id) DO UPDATE SET activation_percentage = 45;

-- Leg extension: add Femorali (5%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 5, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Leg extension' AND m.name = 'Femorali'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Curl bilanciere (e06e39f3): add Avambracci (25%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('e06e39f3-d532-43f9-aafd-b43113c44224', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 25, 'secondary')
ON CONFLICT (exercise_id, muscle_group_id) DO UPDATE SET activation_percentage = 25;

-- Curl manubri (d605c03e): add Avambracci (20%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('d605c03e-80e4-4608-954d-f6ddb0f86ba4', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 20, 'secondary')
ON CONFLICT (exercise_id, muscle_group_id) DO UPDATE SET activation_percentage = 20;

-- RDL: add Polpacci (25%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 25, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'RDL' AND m.name = 'Polpacci'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Squat: add Glutei (48%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 48, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Squat' AND m.name = 'Glutei'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);

-- Squat: add Femorali (35%)
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
SELECT e.id, m.id, 35, 'secondary'
FROM exercises e, muscle_groups m
WHERE e.name = 'Squat' AND m.name = 'Femorali'
AND NOT EXISTS (
  SELECT 1 FROM exercise_muscles em
  WHERE em.exercise_id = e.id AND em.muscle_group_id = m.id
);
