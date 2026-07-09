-- ============================================================
-- Setup base data: equipment_types and muscle_groups
-- Run FIRST before any imports
-- ============================================================

-- 1. Create equipment_types table
CREATE TABLE IF NOT EXISTS equipment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Create muscle_groups table
CREATE TABLE IF NOT EXISTS muscle_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Populate equipment_types
INSERT INTO equipment_types (name) VALUES
  ('Manubri'),
  ('Bilanciere'),
  ('Bilanciere Z'),
  ('Cavi'),
  ('Macchina'),
  ('Multipower')
ON CONFLICT (name) DO NOTHING;

-- 4. Populate muscle_groups
INSERT INTO muscle_groups (name) VALUES
  ('petto'),
  ('spalle'),
  ('bicipiti'),
  ('tricipiti'),
  ('schiena'),
  ('addominali'),
  ('gambe'),
  ('polpacci'),
  ('glutei')
ON CONFLICT (name) DO NOTHING;

-- 5. RLS for equipment_types
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "equipment_types_public" ON equipment_types
  FOR SELECT USING (true);

-- 6. RLS for muscle_groups
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "muscle_groups_public" ON muscle_groups
  FOR SELECT USING (true);

SELECT 'Base data setup complete' as status;
