-- ============================================================
-- Normalize equipment to a proper table
-- Add equipment_types table and equipment_id FK to exercises
-- ============================================================

-- 1. Create equipment_types table
CREATE TABLE IF NOT EXISTS equipment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Insert standard equipment types
INSERT INTO equipment_types (name) VALUES
  ('Manubri'),
  ('Bilanciere'),
  ('Bilanciere Z'),
  ('Cavi'),
  ('Macchina'),
  ('Multipower')
ON CONFLICT (name) DO NOTHING;

-- 3. Add equipment_id column to exercises (if not exists)
ALTER TABLE exercises ADD COLUMN equipment_id uuid REFERENCES equipment_types(id) ON DELETE SET NULL;

-- 4. Migrate existing equipment values to equipment_id
UPDATE exercises SET equipment_id = et.id
FROM equipment_types et
WHERE LOWER(exercises.equipment) = LOWER(et.name) AND exercises.equipment_id IS NULL;

-- 5. Clean up old equipment column (optional - keep for now for reference)
-- ALTER TABLE exercises DROP COLUMN equipment;

-- RLS Policy for equipment_types
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_types_public" ON equipment_types
  FOR SELECT USING (true);
