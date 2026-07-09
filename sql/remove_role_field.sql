-- Migration: Remove 'role' field from exercise_muscles
-- Now we rely solely on activation_percentage

-- Step 1: Drop the constraint on role
ALTER TABLE exercise_muscles DROP CONSTRAINT IF EXISTS exercise_muscles_role_check;

-- Step 2: Remove the role column
ALTER TABLE exercise_muscles DROP COLUMN IF EXISTS role;

-- Verify: all exercise_muscles rows now have activation_percentage and no role
-- SELECT exercise_id, muscle_group_id, activation_percentage FROM exercise_muscles;
