-- ============================================================
-- Consolidate duplicate muscle_groups
-- Maps duplicates to canonical versions and updates references
-- ============================================================

-- 1. Update petto → Petto
UPDATE exercise_muscles SET muscle_group_id = '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a'
WHERE muscle_group_id = '9bd0ccf5-2ddf-4dc4-8be5-cb5386e95ff4';

-- 2. Update tricipiti → Tricipiti
UPDATE exercise_muscles SET muscle_group_id = '80fdafca-2fd6-4485-a63a-a99bb3ca73de'
WHERE muscle_group_id = 'b617ed2d-653f-4d5d-a62b-39a6705d4d12';

-- 3. Update bicipiti → Bicipiti
UPDATE exercise_muscles SET muscle_group_id = '89a58787-8d20-4398-a57e-a219ef1c470f'
WHERE muscle_group_id = 'e74afa7a-b3a8-42e6-b111-accd86b9b6e9';

-- 4. Update schiena → Dorso
UPDATE exercise_muscles SET muscle_group_id = '86e49537-548a-4c0c-bc7c-69dd28e72b41'
WHERE muscle_group_id = '929fa7b1-aa0e-4246-9ccc-a9894ccd9402';

-- 5. Update addominali → Core
UPDATE exercise_muscles SET muscle_group_id = '6451139b-1a47-4650-8ea3-927d5a06628c'
WHERE muscle_group_id = '028b29fb-1481-4635-8568-f727b1c18b7a';

-- 6. Update polpacci → Polpacci
UPDATE exercise_muscles SET muscle_group_id = '29d8f01c-3ab0-4d96-8001-95b308955a64'
WHERE muscle_group_id = 'ddc62b41-e72a-4f33-aab3-9a7ca26174bc';

-- 7. Update glutei → Glutei
UPDATE exercise_muscles SET muscle_group_id = 'f2102e8c-d015-437e-82f5-98047d9eaf1a'
WHERE muscle_group_id = '9802df17-fa32-4c01-b0db-60d001516395';

-- 8. Delete duplicate muscle_groups (keep only canonical)
DELETE FROM muscle_groups
WHERE id IN (
  '9bd0ccf5-2ddf-4dc4-8be5-cb5386e95ff4', -- petto
  'b617ed2d-653f-4d5d-a62b-39a6705d4d12', -- tricipiti
  'e74afa7a-b3a8-42e6-b111-accd86b9b6e9', -- bicipiti
  '929fa7b1-aa0e-4246-9ccc-a9894ccd9402', -- schiena
  '028b29fb-1481-4635-8568-f727b1c18b7a', -- addominali
  'ddc62b41-e72a-4f33-aab3-9a7ca26174bc', -- polpacci
  '9802df17-fa32-4c01-b0db-60d001516395', -- glutei
  '0059e6df-f044-4f45-acfa-3c21ab18c3a3'  -- gambe (remove completely)
);

-- 9. Verify the consolidated muscle_groups
SELECT id, name FROM muscle_groups ORDER BY name;
