-- ============================================================
-- WORKOUT IMPORT — user 36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4
-- Uses ACTUAL muscle_group IDs from the database
-- ============================================================

DO $$
DECLARE
  uid uuid := '36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4';

  -- Equipment IDs
  eq_manubri uuid;
  eq_bilanciere uuid;
  eq_bilanciere_z uuid;
  eq_cavi uuid;
  eq_macchina uuid;
  eq_multipower uuid;

  -- ACTUAL Muscle Group IDs from DB
  mg_petto uuid := '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a';
  mg_spalle uuid := 'ee31242d-e32c-4532-98a2-53638cde2619';
  mg_bicipiti uuid := '89a58787-8d20-4398-a57e-a219ef1c470f';
  mg_tricipiti uuid := '80fdafca-2fd6-4485-a63a-a99bb3ca73de';
  mg_dorso uuid := '86e49537-548a-4c0c-bc7c-69dd28e72b41';
  mg_core uuid := '6451139b-1a47-4650-8ea3-927d5a06628c';
  mg_femorali uuid := '963fba48-53da-4240-99aa-51aec8d6bed9';
  mg_polpacci uuid := '29d8f01c-3ab0-4d96-8001-95b308955a64';
  mg_glutei uuid := 'f2102e8c-d015-437e-82f5-98047d9eaf1a';

  -- 21 Exercises
  ex_panca_piana uuid;
  ex_panca_inclinata uuid;
  ex_croci uuid;
  ex_chest_press uuid;
  ex_alzate_lat_manubri uuid;
  ex_alzate_lat_cavi uuid;
  ex_lento_avanti uuid;
  ex_military_press uuid;
  ex_curl_bilanciere uuid;
  ex_curl_cavi uuid;
  ex_curl_manubri uuid;
  ex_lat_machine uuid;
  ex_row uuid;
  ex_french_press uuid;
  ex_push_down uuid;
  ex_abdominal_machine uuid;
  ex_affondi_bulgari uuid;
  ex_pressa uuid;
  ex_rdl uuid;
  ex_leg_curl uuid;
  ex_leg_extension uuid;
  ex_adductor uuid;
  ex_abductor uuid;
  ex_polpacci uuid;

  -- Templates
  tpl_push uuid;
  tpl_pull_tri uuid;
  tpl_legs uuid;

BEGIN

  -- Get equipment IDs
  SELECT id INTO eq_manubri FROM equipment_types WHERE name = 'Manubri';
  SELECT id INTO eq_bilanciere FROM equipment_types WHERE name = 'Bilanciere';
  SELECT id INTO eq_bilanciere_z FROM equipment_types WHERE name = 'Bilanciere Z';
  SELECT id INTO eq_cavi FROM equipment_types WHERE name = 'Cavi';
  SELECT id INTO eq_macchina FROM equipment_types WHERE name = 'Macchina';
  SELECT id INTO eq_multipower FROM equipment_types WHERE name = 'Multipower';

  -- ============================================================
  -- EXERCISES (21 unique)
  -- ============================================================

  -- PETTO
  SELECT id INTO ex_panca_piana FROM exercises WHERE name = 'Panca piana' AND equipment_id = eq_manubri LIMIT 1;
  IF ex_panca_piana IS NULL THEN
    ex_panca_piana := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_panca_piana, NULL, 'Panca piana', eq_manubri);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_panca_piana, mg_petto, 'primary'), (ex_panca_piana, mg_spalle, 'secondary'), (ex_panca_piana, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_panca_inclinata FROM exercises WHERE name = 'Panca inclinata' AND equipment_id = eq_manubri LIMIT 1;
  IF ex_panca_inclinata IS NULL THEN
    ex_panca_inclinata := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_panca_inclinata, NULL, 'Panca inclinata', eq_manubri);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_panca_inclinata, mg_petto, 'primary'), (ex_panca_inclinata, mg_spalle, 'secondary'), (ex_panca_inclinata, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_croci FROM exercises WHERE name = 'Croci' AND equipment_id = eq_cavi LIMIT 1;
  IF ex_croci IS NULL THEN
    ex_croci := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_croci, NULL, 'Croci', eq_cavi);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_croci, mg_petto, 'primary'), (ex_croci, mg_spalle, 'secondary');
  END IF;

  SELECT id INTO ex_chest_press FROM exercises WHERE name = 'Chest press' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_chest_press IS NULL THEN
    ex_chest_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_chest_press, NULL, 'Chest press', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_chest_press, mg_petto, 'primary'), (ex_chest_press, mg_tricipiti, 'secondary');
  END IF;

  -- SPALLE
  SELECT id INTO ex_alzate_lat_manubri FROM exercises WHERE name = 'Alzate laterali' AND equipment_id = eq_manubri LIMIT 1;
  IF ex_alzate_lat_manubri IS NULL THEN
    ex_alzate_lat_manubri := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_alzate_lat_manubri, NULL, 'Alzate laterali', eq_manubri);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_manubri, mg_spalle, 'primary');
  END IF;

  SELECT id INTO ex_alzate_lat_cavi FROM exercises WHERE name = 'Alzate laterali' AND equipment_id = eq_cavi LIMIT 1;
  IF ex_alzate_lat_cavi IS NULL THEN
    ex_alzate_lat_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_alzate_lat_cavi, NULL, 'Alzate laterali', eq_cavi);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_cavi, mg_spalle, 'primary');
  END IF;

  SELECT id INTO ex_lento_avanti FROM exercises WHERE name = 'Lento avanti' AND equipment_id = eq_manubri LIMIT 1;
  IF ex_lento_avanti IS NULL THEN
    ex_lento_avanti := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_lento_avanti, NULL, 'Lento avanti', eq_manubri);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_lento_avanti, mg_spalle, 'primary'), (ex_lento_avanti, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_military_press FROM exercises WHERE name = 'Military press' AND equipment_id = eq_multipower LIMIT 1;
  IF ex_military_press IS NULL THEN
    ex_military_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_military_press, NULL, 'Military press', eq_multipower);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_military_press, mg_spalle, 'primary'), (ex_military_press, mg_tricipiti, 'secondary');
  END IF;

  -- BICIPITI
  SELECT id INTO ex_curl_bilanciere FROM exercises WHERE name = 'Curl' AND equipment_id = eq_bilanciere_z LIMIT 1;
  IF ex_curl_bilanciere IS NULL THEN
    ex_curl_bilanciere := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_curl_bilanciere, NULL, 'Curl', eq_bilanciere_z);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_bilanciere, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_curl_cavi FROM exercises WHERE name = 'Curl' AND equipment_id = eq_cavi LIMIT 1;
  IF ex_curl_cavi IS NULL THEN
    ex_curl_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_curl_cavi, NULL, 'Curl', eq_cavi);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_cavi, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_curl_manubri FROM exercises WHERE name = 'Curl' AND equipment_id = eq_manubri LIMIT 1;
  IF ex_curl_manubri IS NULL THEN
    ex_curl_manubri := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_curl_manubri, NULL, 'Curl', eq_manubri);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_manubri, mg_bicipiti, 'primary');
  END IF;

  -- DORSO
  SELECT id INTO ex_lat_machine FROM exercises WHERE name = 'Lat machine' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_lat_machine IS NULL THEN
    ex_lat_machine := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_lat_machine, NULL, 'Lat machine', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_lat_machine, mg_dorso, 'primary'), (ex_lat_machine, mg_bicipiti, 'secondary');
  END IF;

  SELECT id INTO ex_row FROM exercises WHERE name = 'Row' AND equipment_id = eq_cavi LIMIT 1;
  IF ex_row IS NULL THEN
    ex_row := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_row, NULL, 'Row', eq_cavi);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_row, mg_dorso, 'primary'), (ex_row, mg_bicipiti, 'secondary');
  END IF;

  -- TRICIPITI
  SELECT id INTO ex_french_press FROM exercises WHERE name = 'French press' AND equipment_id = eq_bilanciere LIMIT 1;
  IF ex_french_press IS NULL THEN
    ex_french_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_french_press, NULL, 'French press', eq_bilanciere);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_french_press, mg_tricipiti, 'primary');
  END IF;

  SELECT id INTO ex_push_down FROM exercises WHERE name = 'Push down' AND equipment_id = eq_cavi LIMIT 1;
  IF ex_push_down IS NULL THEN
    ex_push_down := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_push_down, NULL, 'Push down', eq_cavi);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_push_down, mg_tricipiti, 'primary');
  END IF;

  -- CORE/ADDOMINALI
  SELECT id INTO ex_abdominal_machine FROM exercises WHERE name = 'Abdominal machine' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_abdominal_machine IS NULL THEN
    ex_abdominal_machine := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_abdominal_machine, NULL, 'Abdominal machine', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abdominal_machine, mg_core, 'primary');
  END IF;

  -- GAMBE
  SELECT id INTO ex_affondi_bulgari FROM exercises WHERE name = 'Affondi bulgari' AND equipment_id = eq_manubri LIMIT 1;
  IF ex_affondi_bulgari IS NULL THEN
    ex_affondi_bulgari := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_affondi_bulgari, NULL, 'Affondi bulgari', eq_manubri);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_affondi_bulgari, mg_femorali, 'primary'), (ex_affondi_bulgari, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_pressa FROM exercises WHERE name = 'Pressa' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_pressa IS NULL THEN
    ex_pressa := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_pressa, NULL, 'Pressa', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_pressa, mg_femorali, 'primary'), (ex_pressa, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_rdl FROM exercises WHERE name = 'RDL' AND equipment_id = eq_bilanciere LIMIT 1;
  IF ex_rdl IS NULL THEN
    ex_rdl := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_rdl, NULL, 'RDL', eq_bilanciere);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_rdl, mg_femorali, 'primary'), (ex_rdl, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_leg_curl FROM exercises WHERE name = 'Leg curl' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_leg_curl IS NULL THEN
    ex_leg_curl := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_leg_curl, NULL, 'Leg curl', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_curl, mg_femorali, 'primary');
  END IF;

  SELECT id INTO ex_leg_extension FROM exercises WHERE name = 'Leg extension' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_leg_extension IS NULL THEN
    ex_leg_extension := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_leg_extension, NULL, 'Leg extension', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_extension, mg_femorali, 'primary');
  END IF;

  SELECT id INTO ex_adductor FROM exercises WHERE name = 'Adductor' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_adductor IS NULL THEN
    ex_adductor := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_adductor, NULL, 'Adductor', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_adductor, mg_femorali, 'primary');
  END IF;

  SELECT id INTO ex_abductor FROM exercises WHERE name = 'Abductor' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_abductor IS NULL THEN
    ex_abductor := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_abductor, NULL, 'Abductor', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abductor, mg_femorali, 'primary');
  END IF;

  SELECT id INTO ex_polpacci FROM exercises WHERE name = 'Polpacci' AND equipment_id = eq_macchina LIMIT 1;
  IF ex_polpacci IS NULL THEN
    ex_polpacci := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment_id) VALUES (ex_polpacci, NULL, 'Polpacci', eq_macchina);
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_polpacci, mg_polpacci, 'primary');
  END IF;

  -- ============================================================
  -- TEMPLATES
  -- ============================================================

  tpl_push := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_push, uid, 'PUSH — Petto · Spalle · Bicipiti');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_push, ex_panca_piana, 3, 8, 0),
    (tpl_push, ex_alzate_lat_manubri, 3, 10, 1),
    (tpl_push, ex_curl_bilanciere, 3, 8, 2),
    (tpl_push, ex_croci, 3, 12, 3),
    (tpl_push, ex_alzate_lat_cavi, 3, 12, 4),
    (tpl_push, ex_curl_cavi, 3, 12, 5);

  tpl_pull_tri := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_pull_tri, uid, 'PULL & TRI — Schiena · Tricipiti');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_pull_tri, ex_lat_machine, 3, 8, 0),
    (tpl_pull_tri, ex_row, 3, 8, 1),
    (tpl_pull_tri, ex_french_press, 3, 10, 2),
    (tpl_pull_tri, ex_push_down, 3, 12, 3),
    (tpl_pull_tri, ex_curl_cavi, 3, 12, 4),
    (tpl_pull_tri, ex_abdominal_machine, 3, 8, 5);

  tpl_legs := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_legs, uid, 'LEGS — Gambe');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_legs, ex_pressa, 3, 8, 0),
    (tpl_legs, ex_leg_curl, 3, 12, 1),
    (tpl_legs, ex_rdl, 3, 12, 2),
    (tpl_legs, ex_adductor, 3, 10, 3),
    (tpl_legs, ex_polpacci, 3, 8, 4);

  RAISE NOTICE 'Import completed: exercises and templates created';

END $$;
