-- ============================================================
-- Setup admin system
-- ============================================================

-- 1. Create admins table
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS but allow everyone to read for verification
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. RLS policy - everyone can read admins (needed for verification)
CREATE POLICY "admins_select" ON admins
  FOR SELECT USING (true);

-- 4. Add initial admin
INSERT INTO admins (user_id) VALUES ('bf678a34-681b-44d7-aa22-9d8f50953bab')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Update RLS policies for global data management by admins

-- equipment_types: admins can CRUD global equipment
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipment_types_select_all" ON equipment_types;
DROP POLICY IF EXISTS "equipment_types_insert_admin" ON equipment_types;
DROP POLICY IF EXISTS "equipment_types_update_admin" ON equipment_types;
DROP POLICY IF EXISTS "equipment_types_delete_admin" ON equipment_types;

CREATE POLICY "equipment_types_select_all" ON equipment_types
  FOR SELECT USING (true);

CREATE POLICY "equipment_types_insert_admin" ON equipment_types
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "equipment_types_update_admin" ON equipment_types
  FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "equipment_types_delete_admin" ON equipment_types
  FOR DELETE USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- muscle_groups: admins can CRUD
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "muscle_groups_select_all" ON muscle_groups;
DROP POLICY IF EXISTS "muscle_groups_insert_admin" ON muscle_groups;
DROP POLICY IF EXISTS "muscle_groups_update_admin" ON muscle_groups;
DROP POLICY IF EXISTS "muscle_groups_delete_admin" ON muscle_groups;

CREATE POLICY "muscle_groups_select_all" ON muscle_groups
  FOR SELECT USING (true);

CREATE POLICY "muscle_groups_insert_admin" ON muscle_groups
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "muscle_groups_update_admin" ON muscle_groups
  FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "muscle_groups_delete_admin" ON muscle_groups
  FOR DELETE USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- exercises: allow global exercise management by admins
DROP POLICY IF EXISTS "exercises_insert_admin" ON exercises;
DROP POLICY IF EXISTS "exercises_update_admin" ON exercises;
DROP POLICY IF EXISTS "exercises_delete_admin" ON exercises;

CREATE POLICY "exercises_insert_admin" ON exercises
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  );

CREATE POLICY "exercises_update_admin" ON exercises
  FOR UPDATE USING (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  );

CREATE POLICY "exercises_delete_admin" ON exercises
  FOR DELETE USING (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  );

-- exercise_muscles: admins can manage
DROP POLICY IF EXISTS "exercise_muscles_insert_admin" ON exercise_muscles;
DROP POLICY IF EXISTS "exercise_muscles_update_admin" ON exercise_muscles;
DROP POLICY IF EXISTS "exercise_muscles_delete_admin" ON exercise_muscles;

CREATE POLICY "exercise_muscles_insert_admin" ON exercise_muscles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_id AND
      (e.user_id = auth.uid() OR
       (e.user_id IS NULL AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())))
    )
  );

CREATE POLICY "exercise_muscles_update_admin" ON exercise_muscles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_id AND
      (e.user_id = auth.uid() OR
       (e.user_id IS NULL AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())))
    )
  );

CREATE POLICY "exercise_muscles_delete_admin" ON exercise_muscles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_id AND
      (e.user_id = auth.uid() OR
       (e.user_id IS NULL AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())))
    )
  );

SELECT 'Admin system setup complete' as status;
