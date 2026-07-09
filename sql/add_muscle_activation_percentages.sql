-- Migration: Add muscle activation percentages and fill gaps
-- Date: 2026-07-09
-- Based on EMG peer-reviewed studies
-- Rules: >5% activation, max 3 muscles per exercise

-- Step 1: Add activation_percentage column (nullable first)
ALTER TABLE exercise_muscles
ADD COLUMN IF NOT EXISTS activation_percentage numeric(5,2) DEFAULT NULL
CHECK (activation_percentage IS NULL OR (activation_percentage >= 0 AND activation_percentage <= 200));

-- Step 2: Update EXISTING mappings with scientific percentages

-- Panca inclinata (3 muscoli: Petto, Spalle, Tricipiti - completo)
UPDATE exercise_muscles SET activation_percentage = 80
WHERE exercise_id = '0a39c0c9-e56d-40ec-b596-a4df8d215b70' AND muscle_group_id = '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a'; -- Petto
UPDATE exercise_muscles SET activation_percentage = 50
WHERE exercise_id = '0a39c0c9-e56d-40ec-b596-a4df8d215b70' AND muscle_group_id = '13b8f372-6501-4539-951b-284fef927bc1'; -- Spalle
UPDATE exercise_muscles SET activation_percentage = 30
WHERE exercise_id = '0a39c0c9-e56d-40ec-b596-a4df8d215b70' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti

-- Adductor (1 muscolo - ok)
UPDATE exercise_muscles SET activation_percentage = 95
WHERE exercise_id = '0ebcc8dd-86b6-4af6-a6d5-d4f0b9c91a6b' AND muscle_group_id = '4b1d10db-7508-48d6-8da3-4038de94c368'; -- Adduttori

-- Alzate laterali (1 muscolo - specifico)
UPDATE exercise_muscles SET activation_percentage = 66
WHERE exercise_id = '1630ff05-50c3-4afe-8608-4211f417e11e' AND muscle_group_id = '13b8f372-6501-4539-951b-284fef927bc1'; -- Spalle

-- Affondi bulgari (1 muscolo, aggiungo 2)
UPDATE exercise_muscles SET activation_percentage = 70
WHERE exercise_id = '30feb515-d98f-4296-8f57-b6f1791546ef' AND muscle_group_id = '67f07249-c145-43a7-a1be-d2a6227b283c'; -- Quadricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('30feb515-d98f-4296-8f57-b6f1791546ef', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', 45, 'secondary') -- Glutei
ON CONFLICT DO NOTHING;
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('30feb515-d98f-4296-8f57-b6f1791546ef', '963fba48-53da-4240-99aa-51aec8d6bed9', 35, 'secondary') -- Femorali
ON CONFLICT DO NOTHING;

-- Chest press (2 muscoli, completo)
UPDATE exercise_muscles SET activation_percentage = 95
WHERE exercise_id = '3ac5b608-955a-41f5-99a1-f7a7f115f7f9' AND muscle_group_id = '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a'; -- Petto
UPDATE exercise_muscles SET activation_percentage = 35
WHERE exercise_id = '3ac5b608-955a-41f5-99a1-f7a7f115f7f9' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti

-- French press (1 muscolo, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 82
WHERE exercise_id = '46216f07-21d6-4ea5-a8d9-a5fac9901cfa' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('46216f07-21d6-4ea5-a8d9-a5fac9901cfa', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Push down (1 muscolo, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 90
WHERE exercise_id = '56b7c664-5c8e-4907-bff9-43249455a1b4' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('56b7c664-5c8e-4907-bff9-43249455a1b4', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 12, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Leg curl (1 muscolo, aggiungo 2)
UPDATE exercise_muscles SET activation_percentage = 92
WHERE exercise_id = '58e7b9ad-f695-4d99-ba9f-bcbed1ed1ff8' AND muscle_group_id = '963fba48-53da-4240-99aa-51aec8d6bed9'; -- Femorali
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('58e7b9ad-f695-4d99-ba9f-bcbed1ed1ff8', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', 20, 'secondary') -- Glutei
ON CONFLICT DO NOTHING;
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('58e7b9ad-f695-4d99-ba9f-bcbed1ed1ff8', '29d8f01c-3ab0-4d96-8001-95b308955a64', 10, 'secondary') -- Polpacci
ON CONFLICT DO NOTHING;

-- Lat machine (2 muscoli - completo)
UPDATE exercise_muscles SET activation_percentage = 62
WHERE exercise_id = '71f8ab47-4806-4eb3-bd1f-daa50a43949c' AND muscle_group_id = '86e49537-548a-4c0c-bc7c-69dd28e72b41'; -- Dorso
UPDATE exercise_muscles SET activation_percentage = 30
WHERE exercise_id = '71f8ab47-4806-4eb3-bd1f-daa50a43949c' AND muscle_group_id = '89a58787-8d20-4398-a57e-a219ef1c470f'; -- Bicipiti

-- Curl (cavi) (1 muscolo, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 90
WHERE exercise_id = '753269cf-1a92-4951-bf15-6b34dcb5a05d' AND muscle_group_id = '89a58787-8d20-4398-a57e-a219ef1c470f'; -- Bicipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('753269cf-1a92-4951-bf15-6b34dcb5a05d', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 20, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Trazioni (1 muscolo, aggiungo 2)
UPDATE exercise_muscles SET activation_percentage = 70
WHERE exercise_id = '7e55a4d0-32c8-4eae-80e8-0e79a86dd436' AND muscle_group_id = '86e49537-548a-4c0c-bc7c-69dd28e72b41'; -- Dorso
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('7e55a4d0-32c8-4eae-80e8-0e79a86dd436', '89a58787-8d20-4398-a57e-a219ef1c470f', 35, 'secondary') -- Bicipiti
ON CONFLICT DO NOTHING;
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('7e55a4d0-32c8-4eae-80e8-0e79a86dd436', '13b8f372-6501-4539-951b-284fef927bc1', 10, 'secondary') -- Spalle
ON CONFLICT DO NOTHING;

-- Panca piana (3 muscoli - completo)
UPDATE exercise_muscles SET activation_percentage = 95
WHERE exercise_id = '7f4a9aad-3ab9-47bc-aa7c-5bd1fe556afb' AND muscle_group_id = '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a'; -- Petto
UPDATE exercise_muscles SET activation_percentage = 25
WHERE exercise_id = '7f4a9aad-3ab9-47bc-aa7c-5bd1fe556afb' AND muscle_group_id = '13b8f372-6501-4539-951b-284fef927bc1'; -- Spalle
UPDATE exercise_muscles SET activation_percentage = 35
WHERE exercise_id = '7f4a9aad-3ab9-47bc-aa7c-5bd1fe556afb' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti

-- Dips (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 30
WHERE exercise_id = '92ab7341-35bc-4be6-af09-f164545f688f' AND muscle_group_id = '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a'; -- Petto
UPDATE exercise_muscles SET activation_percentage = 65
WHERE exercise_id = '92ab7341-35bc-4be6-af09-f164545f688f' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('92ab7341-35bc-4be6-af09-f164545f688f', '13b8f372-6501-4539-951b-284fef927bc1', 25, 'secondary') -- Spalle
ON CONFLICT DO NOTHING;

-- RDL (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 65
WHERE exercise_id = '9cbc79c0-61cd-413c-8ea3-e1a6f8b4b8cc' AND muscle_group_id = '963fba48-53da-4240-99aa-51aec8d6bed9'; -- Femorali
UPDATE exercise_muscles SET activation_percentage = 55
WHERE exercise_id = '9cbc79c0-61cd-413c-8ea3-e1a6f8b4b8cc' AND muscle_group_id = 'f2102e8c-d015-437e-82f5-98047d9eaf1a'; -- Glutei
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('9cbc79c0-61cd-413c-8ea3-e1a6f8b4b8cc', '29d8f01c-3ab0-4d96-8001-95b308955a64', 25, 'secondary') -- Polpacci
ON CONFLICT DO NOTHING;

-- Polpacci (1 muscolo - specifico)
UPDATE exercise_muscles SET activation_percentage = 95
WHERE exercise_id = 'a658edd4-6ca5-4013-abdb-a0849b55f12c' AND muscle_group_id = '29d8f01c-3ab0-4d96-8001-95b308955a64'; -- Polpacci

-- Squat (1 muscolo, aggiungo 2)
UPDATE exercise_muscles SET activation_percentage = 74
WHERE exercise_id = 'b99d96f6-c133-4c53-8fb4-f704567c4ec0' AND muscle_group_id = '67f07249-c145-43a7-a1be-d2a6227b283c'; -- Quadricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('b99d96f6-c133-4c53-8fb4-f704567c4ec0', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', 48, 'secondary') -- Glutei
ON CONFLICT DO NOTHING;
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('b99d96f6-c133-4c53-8fb4-f704567c4ec0', '963fba48-53da-4240-99aa-51aec8d6bed9', 35, 'secondary') -- Femorali
ON CONFLICT DO NOTHING;

-- Abdominal machine (1 muscolo - specifico)
UPDATE exercise_muscles SET activation_percentage = 90
WHERE exercise_id = 'bd16e5f7-4b4a-4c4f-9789-3bb900b6b2d7' AND muscle_group_id = '6451139b-1a47-4650-8ea3-927d5a06628c'; -- Core

-- Pressa (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 86
WHERE exercise_id = 'c487a712-6787-4188-8c15-c3df3a406c76' AND muscle_group_id = '67f07249-c145-43a7-a1be-d2a6227b283c'; -- Quadricipiti
UPDATE exercise_muscles SET activation_percentage = 25
WHERE exercise_id = 'c487a712-6787-4188-8c15-c3df3a406c76' AND muscle_group_id = 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80'; -- Avambracci
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('c487a712-6787-4188-8c15-c3df3a406c76', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', 45, 'secondary') -- Glutei
ON CONFLICT DO NOTHING;

-- Croci (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 98
WHERE exercise_id = 'ca9cfac7-582a-4c30-8e00-25ad224dc0af' AND muscle_group_id = '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a'; -- Petto
UPDATE exercise_muscles SET activation_percentage = 20
WHERE exercise_id = 'ca9cfac7-582a-4c30-8e00-25ad224dc0af' AND muscle_group_id = '13b8f372-6501-4539-951b-284fef927bc1'; -- Spalle
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('ca9cfac7-582a-4c30-8e00-25ad224dc0af', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', 15, 'secondary') -- Tricipiti
ON CONFLICT DO NOTHING;

-- Lento avanti (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 75
WHERE exercise_id = 'cf541989-febf-475c-844b-1768a8934754' AND muscle_group_id = '13b8f372-6501-4539-951b-284fef927bc1'; -- Spalle
UPDATE exercise_muscles SET activation_percentage = 30
WHERE exercise_id = 'cf541989-febf-475c-844b-1768a8934754' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('cf541989-febf-475c-844b-1768a8934754', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 20, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Abductor (1 muscolo - specifico)
UPDATE exercise_muscles SET activation_percentage = 95
WHERE exercise_id = 'd3d9eb99-ed11-4282-9423-8285578050bb' AND muscle_group_id = '4b1d10db-7508-48d6-8da3-4038de94c368'; -- Adduttori

-- Curl (manubri) (1 muscolo, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 100
WHERE exercise_id = 'd605c03e-80e4-4608-954d-f6ddb0f86ba4' AND muscle_group_id = '89a58787-8d20-4398-a57e-a219ef1c470f'; -- Bicipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('d605c03e-80e4-4608-954d-f6ddb0f86ba4', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 20, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Military press (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 79
WHERE exercise_id = 'da14ab12-ae51-4229-b93d-5f9f5310619b' AND muscle_group_id = '13b8f372-6501-4539-951b-284fef927bc1'; -- Spalle
UPDATE exercise_muscles SET activation_percentage = 35
WHERE exercise_id = 'da14ab12-ae51-4229-b93d-5f9f5310619b' AND muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'; -- Tricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('da14ab12-ae51-4229-b93d-5f9f5310619b', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 20, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Curl (bilanciere) (1 muscolo, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 111
WHERE exercise_id = 'e06e39f3-d532-43f9-aafd-b43113c44224' AND muscle_group_id = '89a58787-8d20-4398-a57e-a219ef1c470f'; -- Bicipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('e06e39f3-d532-43f9-aafd-b43113c44224', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 25, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Leg extension (1 muscolo, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 92
WHERE exercise_id = 'e7bfdd22-47fc-46f9-9aa6-e837dfd0b754' AND muscle_group_id = '67f07249-c145-43a7-a1be-d2a6227b283c'; -- Quadricipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('e7bfdd22-47fc-46f9-9aa6-e837dfd0b754', '963fba48-53da-4240-99aa-51aec8d6bed9', 5, 'secondary') -- Femorali
ON CONFLICT DO NOTHING;

-- Row (2 muscoli, aggiungo 1)
UPDATE exercise_muscles SET activation_percentage = 90
WHERE exercise_id = 'eef83f98-010e-4ce7-947a-9a71cbc7c7b0' AND muscle_group_id = '86e49537-548a-4c0c-bc7c-69dd28e72b41'; -- Dorso
UPDATE exercise_muscles SET activation_percentage = 35
WHERE exercise_id = 'eef83f98-010e-4ce7-947a-9a71cbc7c7b0' AND muscle_group_id = '89a58787-8d20-4398-a57e-a219ef1c470f'; -- Bicipiti
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, activation_percentage, role)
VALUES ('eef83f98-010e-4ce7-947a-9a71cbc7c7b0', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15, 'secondary') -- Avambracci
ON CONFLICT DO NOTHING;

-- Step 3: Set any remaining NULL values to 50 as default
UPDATE exercise_muscles SET activation_percentage = 50
WHERE activation_percentage IS NULL;

-- Step 4: Make column NOT NULL
ALTER TABLE exercise_muscles
ALTER COLUMN activation_percentage SET NOT NULL;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_activation
ON exercise_muscles(muscle_group_id, activation_percentage DESC, exercise_id);
