-- Cleanup per user 36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4
-- Elimina tutte le sessioni, template e dati correlati

DO $$
DECLARE
  uid uuid := '36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4';
BEGIN

  -- Elimina i set delle sessioni
  DELETE FROM session_sets WHERE session_id IN (
    SELECT id FROM sessions WHERE user_id = uid
  );

  -- Elimina le sessioni
  DELETE FROM sessions WHERE user_id = uid;

  -- Elimina gli esercizi nei template
  DELETE FROM template_exercises WHERE template_id IN (
    SELECT id FROM workout_templates WHERE user_id = uid
  );

  -- Elimina i template
  DELETE FROM workout_templates WHERE user_id = uid;

  RAISE NOTICE 'Cleaned up all data for user %', uid;

END $$;
