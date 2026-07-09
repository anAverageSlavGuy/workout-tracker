-- ============================================================
-- WORKOUT IMPORT — user 36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4
-- 19 sessions · June–July 2026
-- 21 exercises (nome semplice + equipment)
-- ============================================================

DO $$
DECLARE
  uid uuid := '36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4';
  mg_petto uuid; mg_spalle uuid; mg_bicipiti uuid; mg_tricipiti uuid;
  mg_schiena uuid; mg_addominali uuid; mg_gambe uuid; mg_polpacci uuid; mg_glutei uuid;

  ex_panca_piana uuid; ex_panca_inclinata uuid; ex_croci uuid; ex_chest_press uuid;
  ex_alzate_lat_manbubri uuid; ex_alzate_lat_cavi uuid; ex_lento_avanti uuid; ex_military_press uuid;
  ex_curl_bilanciere uuid; ex_curl_cavi uuid; ex_curl_manubri uuid;
  ex_lat_machine uuid; ex_row_cavi uuid;
  ex_french_press uuid; ex_push_down uuid; ex_abdominal_machine uuid;
  ex_affondi_bulgari uuid; ex_pressa uuid; ex_rdl uuid; ex_leg_curl uuid;
  ex_leg_extension uuid; ex_adductor uuid; ex_abductor uuid; ex_polpacci uuid;

  tpl_push uuid; tpl_pull_tri uuid; tpl_legs uuid;

BEGIN

  -- ============================================================
  -- 1. MUSCLE GROUPS
  -- ============================================================
  SELECT id INTO mg_petto FROM muscle_groups WHERE name = 'petto' LIMIT 1;
  SELECT id INTO mg_spalle FROM muscle_groups WHERE name = 'spalle' LIMIT 1;
  SELECT id INTO mg_bicipiti FROM muscle_groups WHERE name = 'bicipiti' LIMIT 1;
  SELECT id INTO mg_tricipiti FROM muscle_groups WHERE name = 'tricipiti' LIMIT 1;
  SELECT id INTO mg_schiena FROM muscle_groups WHERE name IN ('schiena','dorso') LIMIT 1;
  SELECT id INTO mg_addominali FROM muscle_groups WHERE name IN ('addominali','core') LIMIT 1;
  SELECT id INTO mg_gambe FROM muscle_groups WHERE name IN ('gambe','quadricipiti') LIMIT 1;
  SELECT id INTO mg_polpacci FROM muscle_groups WHERE name = 'polpacci' LIMIT 1;
  SELECT id INTO mg_glutei FROM muscle_groups WHERE name = 'glutei' LIMIT 1;

  IF mg_petto IS NULL THEN mg_petto := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_petto, 'petto'); END IF;
  IF mg_spalle IS NULL THEN mg_spalle := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_spalle, 'spalle'); END IF;
  IF mg_bicipiti IS NULL THEN mg_bicipiti := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_bicipiti, 'bicipiti'); END IF;
  IF mg_tricipiti IS NULL THEN mg_tricipiti := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_tricipiti, 'tricipiti'); END IF;
  IF mg_schiena IS NULL THEN mg_schiena := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_schiena, 'schiena'); END IF;
  IF mg_addominali IS NULL THEN mg_addominali := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_addominali, 'addominali'); END IF;
  IF mg_gambe IS NULL THEN mg_gambe := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_gambe, 'gambe'); END IF;
  IF mg_polpacci IS NULL THEN mg_polpacci := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_polpacci, 'polpacci'); END IF;
  IF mg_glutei IS NULL THEN mg_glutei := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_glutei, 'glutei'); END IF;

  -- ============================================================
  -- 2. EXERCISES
  -- ============================================================

  -- PETTO
  SELECT id INTO ex_panca_piana FROM exercises WHERE name = 'Panca piana' AND equipment = 'Manubri' LIMIT 1;
  IF ex_panca_piana IS NULL THEN
    ex_panca_piana := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_panca_piana, NULL, 'Panca piana', 'Manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_panca_piana, mg_petto, 'primary'), (ex_panca_piana, mg_spalle, 'secondary'), (ex_panca_piana, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_panca_inclinata FROM exercises WHERE name = 'Panca inclinata' AND equipment = 'Manubri' LIMIT 1;
  IF ex_panca_inclinata IS NULL THEN
    ex_panca_inclinata := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_panca_inclinata, NULL, 'Panca inclinata', 'Manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_panca_inclinata, mg_petto, 'primary'), (ex_panca_inclinata, mg_spalle, 'secondary'), (ex_panca_inclinata, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_croci FROM exercises WHERE name = 'Croci' AND equipment = 'Cavi' LIMIT 1;
  IF ex_croci IS NULL THEN
    ex_croci := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_croci, NULL, 'Croci', 'Cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_croci, mg_petto, 'primary'), (ex_croci, mg_spalle, 'secondary');
  END IF;

  SELECT id INTO ex_chest_press FROM exercises WHERE name = 'Chest press' AND equipment = 'Macchina' LIMIT 1;
  IF ex_chest_press IS NULL THEN
    ex_chest_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_chest_press, NULL, 'Chest press', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_chest_press, mg_petto, 'primary'), (ex_chest_press, mg_tricipiti, 'secondary');
  END IF;

  -- SPALLE
  SELECT id INTO ex_alzate_lat_manbubri FROM exercises WHERE name = 'Alzate laterali' AND equipment = 'Manubri' LIMIT 1;
  IF ex_alzate_lat_manbubri IS NULL THEN
    ex_alzate_lat_manbubri := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_alzate_lat_manbubri, NULL, 'Alzate laterali', 'Manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_manbubri, mg_spalle, 'primary');
  END IF;

  SELECT id INTO ex_alzate_lat_cavi FROM exercises WHERE name = 'Alzate laterali' AND equipment = 'Cavi' LIMIT 1;
  IF ex_alzate_lat_cavi IS NULL THEN
    ex_alzate_lat_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_alzate_lat_cavi, NULL, 'Alzate laterali', 'Cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_cavi, mg_spalle, 'primary');
  END IF;

  SELECT id INTO ex_lento_avanti FROM exercises WHERE name = 'Lento avanti' AND equipment = 'Manubri' LIMIT 1;
  IF ex_lento_avanti IS NULL THEN
    ex_lento_avanti := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_lento_avanti, NULL, 'Lento avanti', 'Manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_lento_avanti, mg_spalle, 'primary'), (ex_lento_avanti, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_military_press FROM exercises WHERE name = 'Military press' AND equipment = 'Multipower' LIMIT 1;
  IF ex_military_press IS NULL THEN
    ex_military_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_military_press, NULL, 'Military press', 'Multipower');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_military_press, mg_spalle, 'primary'), (ex_military_press, mg_tricipiti, 'secondary');
  END IF;

  -- BICIPITI (3 varianti)
  SELECT id INTO ex_curl_bilanciere FROM exercises WHERE name = 'Curl' AND equipment = 'Bilanciere Z' LIMIT 1;
  IF ex_curl_bilanciere IS NULL THEN
    ex_curl_bilanciere := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_curl_bilanciere, NULL, 'Curl', 'Bilanciere Z');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_bilanciere, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_curl_cavi FROM exercises WHERE name = 'Curl' AND equipment = 'Cavi' LIMIT 1;
  IF ex_curl_cavi IS NULL THEN
    ex_curl_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_curl_cavi, NULL, 'Curl', 'Cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_cavi, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_curl_manubri FROM exercises WHERE name = 'Curl' AND equipment = 'Manubri' LIMIT 1;
  IF ex_curl_manubri IS NULL THEN
    ex_curl_manubri := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_curl_manubri, NULL, 'Curl', 'Manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_manubri, mg_bicipiti, 'primary');
  END IF;

  -- SCHIENA
  SELECT id INTO ex_lat_machine FROM exercises WHERE name = 'Lat machine' AND equipment = 'Macchina' LIMIT 1;
  IF ex_lat_machine IS NULL THEN
    ex_lat_machine := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_lat_machine, NULL, 'Lat machine', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_lat_machine, mg_schiena, 'primary'), (ex_lat_machine, mg_bicipiti, 'secondary');
  END IF;

  SELECT id INTO ex_row_cavi FROM exercises WHERE name = 'Row' AND equipment = 'Cavi' LIMIT 1;
  IF ex_row_cavi IS NULL THEN
    ex_row_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_row_cavi, NULL, 'Row', 'Cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_row_cavi, mg_schiena, 'primary'), (ex_row_cavi, mg_bicipiti, 'secondary');
  END IF;

  -- TRICIPITI
  SELECT id INTO ex_french_press FROM exercises WHERE name = 'French press' AND equipment = 'Bilanciere' LIMIT 1;
  IF ex_french_press IS NULL THEN
    ex_french_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_french_press, NULL, 'French press', 'Bilanciere');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_french_press, mg_tricipiti, 'primary');
  END IF;

  SELECT id INTO ex_push_down FROM exercises WHERE name = 'Push down' AND equipment = 'Cavi' LIMIT 1;
  IF ex_push_down IS NULL THEN
    ex_push_down := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_push_down, NULL, 'Push down', 'Cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_push_down, mg_tricipiti, 'primary');
  END IF;

  -- ADDOMINALI
  SELECT id INTO ex_abdominal_machine FROM exercises WHERE name = 'Abdominal machine' AND equipment = 'Macchina' LIMIT 1;
  IF ex_abdominal_machine IS NULL THEN
    ex_abdominal_machine := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_abdominal_machine, NULL, 'Abdominal machine', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abdominal_machine, mg_addominali, 'primary');
  END IF;

  -- GAMBE
  SELECT id INTO ex_affondi_bulgari FROM exercises WHERE name = 'Affondi bulgari' AND equipment = 'Manubri' LIMIT 1;
  IF ex_affondi_bulgari IS NULL THEN
    ex_affondi_bulgari := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_affondi_bulgari, NULL, 'Affondi bulgari', 'Manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_affondi_bulgari, mg_gambe, 'primary'), (ex_affondi_bulgari, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_pressa FROM exercises WHERE name = 'Pressa' AND equipment = 'Macchina' LIMIT 1;
  IF ex_pressa IS NULL THEN
    ex_pressa := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_pressa, NULL, 'Pressa', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_pressa, mg_gambe, 'primary'), (ex_pressa, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_rdl FROM exercises WHERE name = 'RDL' AND equipment = 'Bilanciere' LIMIT 1;
  IF ex_rdl IS NULL THEN
    ex_rdl := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_rdl, NULL, 'RDL', 'Bilanciere');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_rdl, mg_gambe, 'primary'), (ex_rdl, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_leg_curl FROM exercises WHERE name = 'Leg curl' AND equipment = 'Macchina' LIMIT 1;
  IF ex_leg_curl IS NULL THEN
    ex_leg_curl := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_leg_curl, NULL, 'Leg curl', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_curl, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_leg_extension FROM exercises WHERE name = 'Leg extension' AND equipment = 'Macchina' LIMIT 1;
  IF ex_leg_extension IS NULL THEN
    ex_leg_extension := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_leg_extension, NULL, 'Leg extension', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_extension, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_adductor FROM exercises WHERE name = 'Adductor' AND equipment = 'Macchina' LIMIT 1;
  IF ex_adductor IS NULL THEN
    ex_adductor := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_adductor, NULL, 'Adductor', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_adductor, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_abductor FROM exercises WHERE name = 'Abductor' AND equipment = 'Macchina' LIMIT 1;
  IF ex_abductor IS NULL THEN
    ex_abductor := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_abductor, NULL, 'Abductor', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abductor, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_polpacci FROM exercises WHERE name = 'Polpacci' AND equipment = 'Macchina' LIMIT 1;
  IF ex_polpacci IS NULL THEN
    ex_polpacci := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_polpacci, NULL, 'Polpacci', 'Macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_polpacci, mg_polpacci, 'primary');
  END IF;

  -- ============================================================
  -- 3. TEMPLATES
  -- ============================================================

  tpl_push := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_push, uid, 'PUSH — Petto · Spalle · Bicipiti');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_push, ex_panca_piana, 3, 8, 0),
    (tpl_push, ex_alzate_lat_manbubri, 3, 10, 1),
    (tpl_push, ex_curl_bilanciere, 3, 8, 2),
    (tpl_push, ex_croci, 3, 12, 3),
    (tpl_push, ex_alzate_lat_cavi, 3, 12, 4),
    (tpl_push, ex_curl_cavi, 3, 12, 5);

  tpl_pull_tri := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_pull_tri, uid, 'PULL & TRI — Schiena · Tricipiti');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_pull_tri, ex_lat_machine, 3, 8, 0),
    (tpl_pull_tri, ex_row_cavi, 3, 8, 1),
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

  -- ============================================================
  -- 4. SESSIONS (19 total)
  -- ============================================================

  -- 01/06/26 — PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-01', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_panca_piana, 30, 7), (2, ex_panca_piana, 30, 7), (3, ex_panca_piana, 30, 5),
      (4, ex_alzate_lat_manbubri, 10, 10), (5, ex_alzate_lat_manbubri, 10, 10), (6, ex_alzate_lat_manbubri, 10, 10),
      (7, ex_curl_bilanciere, 25, 7), (8, ex_curl_bilanciere, 25, 7), (9, ex_curl_bilanciere, 25, 6),
      (10, ex_alzate_lat_cavi, 3.75, 12), (11, ex_alzate_lat_cavi, 3.75, 12), (12, ex_alzate_lat_cavi, 3.75, 12),
      (13, ex_curl_cavi, 20, 12), (14, ex_curl_cavi, 20, 10), (15, ex_curl_cavi, 20, 10)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-01' AND e.id = v.ex_id;

  -- 04/06/26 — PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-04', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_lat_machine, 80, 8), (2, ex_lat_machine, 80, 8), (3, ex_lat_machine, 80, 5),
      (4, ex_row_cavi, 80, 8), (5, ex_row_cavi, 80, 8), (6, ex_row_cavi, 80, 8),
      (7, ex_french_press, 25, 10), (8, ex_french_press, 25, 10), (9, ex_french_press, 25, 8),
      (10, ex_row_cavi, 60, 10), (11, ex_row_cavi, 60, 10), (12, ex_row_cavi, 60, 10),
      (13, ex_push_down, 17, 12), (14, ex_push_down, 17, 12), (15, ex_push_down, 17, 12),
      (16, ex_abdominal_machine, 60, 8), (17, ex_abdominal_machine, 60, 8), (18, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-04' AND e.id = v.ex_id;

  -- 05/06/26 — LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-05', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_affondi_bulgari, 12, 8), (2, ex_affondi_bulgari, 12, 8), (3, ex_affondi_bulgari, 12, 8),
      (4, ex_leg_curl, 40, 12), (5, ex_leg_curl, 40, 12), (6, ex_leg_curl, 40, 12),
      (7, ex_rdl, 40, 12), (8, ex_rdl, 40, 12), (9, ex_rdl, 40, 12),
      (10, ex_adductor, 60, 10), (11, ex_adductor, 60, 10), (12, ex_adductor, 60, 10),
      (13, ex_abductor, 50, 8), (14, ex_abductor, 50, 8),
      (15, ex_polpacci, 130, 8), (16, ex_polpacci, 130, 8), (17, ex_polpacci, 130, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-05' AND e.id = v.ex_id;

  -- 08/06/26 — PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-08', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_panca_piana, 30, 8), (2, ex_panca_piana, 30, 7), (3, ex_panca_piana, 30, 6),
      (4, ex_alzate_lat_manbubri, 10, 10), (5, ex_alzate_lat_manbubri, 10, 10), (6, ex_alzate_lat_manbubri, 10, 10),
      (7, ex_curl_bilanciere, 25, 7), (8, ex_curl_bilanciere, 25, 7), (9, ex_curl_bilanciere, 25, 6),
      (10, ex_croci, 7.5, 12), (11, ex_croci, 7.5, 12), (12, ex_croci, 7.5, 12),
      (13, ex_alzate_lat_cavi, 3.75, 12), (14, ex_alzate_lat_cavi, 3.75, 12), (15, ex_alzate_lat_cavi, 3.75, 12),
      (16, ex_curl_cavi, 20, 12), (17, ex_curl_cavi, 20, 10), (18, ex_curl_cavi, 20, 10)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-08' AND e.id = v.ex_id;

  -- 09/06/26 — PULL & TRI (short)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-09', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_row_cavi, 80, 8), (2, ex_row_cavi, 80, 8), (3, ex_row_cavi, 80, 8),
      (4, ex_french_press, 25, 10), (5, ex_french_press, 25, 10), (6, ex_french_press, 25, 10),
      (7, ex_row_cavi, 60, 12), (8, ex_row_cavi, 60, 12), (9, ex_row_cavi, 60, 12),
      (10, ex_push_down, 17, 12), (11, ex_push_down, 17, 12), (12, ex_push_down, 17, 12),
      (13, ex_abdominal_machine, 60, 8), (14, ex_abdominal_machine, 60, 8), (15, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-09' AND e.id = v.ex_id;

  -- 12/06/26 — LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-12', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_affondi_bulgari, 14, 8), (2, ex_affondi_bulgari, 14, 8), (3, ex_affondi_bulgari, 14, 8),
      (4, ex_adductor, 60, 8), (5, ex_adductor, 60, 8), (6, ex_adductor, 60, 8),
      (7, ex_rdl, 50, 12), (8, ex_rdl, 50, 12), (9, ex_rdl, 50, 12),
      (10, ex_leg_curl, 30, 12), (11, ex_leg_curl, 30, 12), (12, ex_leg_curl, 30, 12),
      (13, ex_polpacci, 130, 8), (14, ex_polpacci, 130, 8), (15, ex_polpacci, 130, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-12' AND e.id = v.ex_id;

  -- 16/06/26 — PUSH (variante inclinata)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-16', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_panca_piana, 30, 8), (2, ex_panca_piana, 30, 7), (3, ex_panca_piana, 30, 6),
      (4, ex_alzate_lat_manbubri, 10, 10), (5, ex_alzate_lat_manbubri, 10, 10), (6, ex_alzate_lat_manbubri, 10, 10),
      (7, ex_curl_manubri, 14, 8), (8, ex_curl_manubri, 14, 8), (9, ex_curl_manubri, 14, 8),
      (10, ex_croci, 7.5, 12), (11, ex_croci, 7.5, 12), (12, ex_croci, 7.5, 12),
      (13, ex_alzate_lat_cavi, 3.75, 12), (14, ex_alzate_lat_cavi, 3.75, 12), (15, ex_alzate_lat_cavi, 3.75, 12),
      (16, ex_curl_cavi, 22, 12), (17, ex_curl_cavi, 22, 12), (18, ex_curl_cavi, 22, 12)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-16' AND e.id = v.ex_id;

  -- 19/06/26 — PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-19', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_french_press, 27, 10), (2, ex_french_press, 27, 10), (3, ex_french_press, 27, 6),
      (4, ex_row_cavi, 80, 10), (5, ex_row_cavi, 80, 10), (6, ex_row_cavi, 80, 6),
      (7, ex_push_down, 22.5, 12), (8, ex_push_down, 22.5, 12), (9, ex_push_down, 22.5, 12),
      (10, ex_row_cavi, 60, 12), (11, ex_row_cavi, 60, 12), (12, ex_row_cavi, 60, 12),
      (13, ex_abdominal_machine, 60, 8), (14, ex_abdominal_machine, 60, 8), (15, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-19' AND e.id = v.ex_id;

  -- 20/06/26 — LEGS + ABS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-20', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_affondi_bulgari, 14, 8), (2, ex_affondi_bulgari, 14, 8), (3, ex_affondi_bulgari, 14, 8),
      (4, ex_rdl, 50, 12), (5, ex_rdl, 50, 12), (6, ex_rdl, 50, 12),
      (7, ex_leg_curl, 30, 12), (8, ex_leg_curl, 30, 12), (9, ex_leg_curl, 30, 12),
      (10, ex_adductor, 60, 8), (11, ex_adductor, 60, 8), (12, ex_adductor, 60, 8),
      (13, ex_polpacci, 130, 8), (14, ex_polpacci, 130, 8), (15, ex_polpacci, 130, 8),
      (16, ex_abdominal_machine, 60, 8), (17, ex_abdominal_machine, 60, 8), (18, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-20' AND e.id = v.ex_id;

  -- 21/06/26 — PUSH (panca 30° inclinata)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-21', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_panca_inclinata, 26, 6), (2, ex_panca_inclinata, 26, 6), (3, ex_panca_inclinata, 26, 6),
      (4, ex_curl_bilanciere, 25, 8), (5, ex_curl_bilanciere, 25, 7), (6, ex_curl_bilanciere, 25, 7),
      (7, ex_alzate_lat_manbubri, 10, 10), (8, ex_alzate_lat_manbubri, 10, 10), (9, ex_alzate_lat_manbubri, 10, 10),
      (10, ex_croci, 7.5, 12), (11, ex_croci, 7.5, 12), (12, ex_croci, 7.5, 12),
      (13, ex_alzate_lat_cavi, 3.75, 12), (14, ex_alzate_lat_cavi, 3.75, 10), (15, ex_alzate_lat_cavi, 3.75, 10),
      (16, ex_curl_cavi, 20, 12), (17, ex_curl_cavi, 20, 10), (18, ex_curl_cavi, 20, 10)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-21' AND e.id = v.ex_id;

  -- 22/06/26 — PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-22', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_row_cavi, 80, 10), (2, ex_row_cavi, 80, 10), (3, ex_row_cavi, 80, 8),
      (4, ex_french_press, 25, 10), (5, ex_french_press, 25, 10), (6, ex_french_press, 25, 6),
      (7, ex_row_cavi, 60, 12), (8, ex_row_cavi, 60, 12), (9, ex_row_cavi, 60, 12),
      (10, ex_push_down, 17.5, 12), (11, ex_push_down, 17.5, 12), (12, ex_push_down, 17.5, 12),
      (13, ex_abdominal_machine, 60, 8), (14, ex_abdominal_machine, 60, 8), (15, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-22' AND e.id = v.ex_id;

  -- 23/06/26 — LEGS (con pressa, leg curl senza peso)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-23', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_pressa, 150, 8), (2, ex_pressa, 150, 8), (3, ex_pressa, 150, 6),
      (4, ex_adductor, 60, 8), (5, ex_adductor, 60, 8), (6, ex_adductor, 60, 8),
      (7, ex_leg_curl, 0, 8), (8, ex_leg_curl, 0, 8), (9, ex_leg_curl, 0, 8),
      (10, ex_rdl, 50, 8), (11, ex_rdl, 50, 8), (12, ex_rdl, 50, 8),
      (13, ex_polpacci, 130, 8), (14, ex_polpacci, 130, 8), (15, ex_polpacci, 130, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-23' AND e.id = v.ex_id;

  -- 26/06/26 — SESSIONE LIBERA (SPALLE)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-26', NULL);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_alzate_lat_manbubri, 10, 10), (2, ex_alzate_lat_manbubri, 10, 10), (3, ex_alzate_lat_manbubri, 10, 10),
      (4, ex_lento_avanti, 20, 10), (5, ex_lento_avanti, 20, 9), (6, ex_lento_avanti, 20, 8),
      (7, ex_alzate_lat_cavi, 3.75, 10), (8, ex_alzate_lat_cavi, 3.75, 10), (9, ex_alzate_lat_cavi, 3.75, 10),
      (10, ex_row_cavi, 80, 10), (11, ex_row_cavi, 80, 10), (12, ex_row_cavi, 80, 10),
      (13, ex_chest_press, 50, 10), (14, ex_chest_press, 50, 10), (15, ex_chest_press, 50, 10),
      (16, ex_push_down, 15, 10), (17, ex_push_down, 20, 10), (18, ex_push_down, 20, 10),
      (19, ex_abdominal_machine, 60, 8), (20, ex_abdominal_machine, 60, 8), (21, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-26' AND e.id = v.ex_id;

  -- 29/06/26 — PUSH (sessione corta)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-29', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_panca_piana, 30, 6), (2, ex_panca_piana, 30, 6), (3, ex_panca_piana, 30, 6),
      (4, ex_croci, 5, 12), (5, ex_croci, 5, 12), (6, ex_croci, 5, 12),
      (7, ex_alzate_lat_manbubri, 10, 10), (8, ex_alzate_lat_manbubri, 10, 10), (9, ex_alzate_lat_manbubri, 10, 10),
      (10, ex_alzate_lat_cavi, 3.75, 12), (11, ex_alzate_lat_cavi, 3.75, 10), (12, ex_alzate_lat_cavi, 3.75, 10)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-29' AND e.id = v.ex_id;

  -- 30/06/26 — PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-30', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_row_cavi, 80, 10), (2, ex_row_cavi, 80, 10), (3, ex_row_cavi, 80, 10),
      (4, ex_french_press, 27, 8), (5, ex_french_press, 27, 8), (6, ex_french_press, 27, 8),
      (7, ex_row_cavi, 60, 12), (8, ex_row_cavi, 70, 12), (9, ex_row_cavi, 70, 12),
      (10, ex_push_down, 20, 12), (11, ex_push_down, 20, 12), (12, ex_push_down, 20, 12),
      (13, ex_abdominal_machine, 60, 8), (14, ex_abdominal_machine, 60, 8), (15, ex_abdominal_machine, 60, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-06-30' AND e.id = v.ex_id;

  -- 01/07/26 — LEGS + MILITARY
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-01', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_pressa, 150, 8), (2, ex_pressa, 150, 8), (3, ex_pressa, 150, 6),
      (4, ex_rdl, 50, 10), (5, ex_rdl, 50, 10), (6, ex_rdl, 50, 10),
      (7, ex_military_press, 40, 8), (8, ex_military_press, 40, 8), (9, ex_military_press, 40, 8),
      (10, ex_leg_curl, 0, 8), (11, ex_leg_curl, 0, 8), (12, ex_leg_curl, 0, 8),
      (13, ex_polpacci, 130, 8), (14, ex_polpacci, 130, 8), (15, ex_polpacci, 130, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-07-01' AND e.id = v.ex_id;

  -- 04/07/26 — SESSIONE MISTA
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-04', NULL);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_alzate_lat_manbubri, 10, 10), (2, ex_alzate_lat_manbubri, 10, 10), (3, ex_alzate_lat_manbubri, 10, 10),
      (4, ex_panca_inclinata, 24, 8), (5, ex_panca_inclinata, 24, 6), (6, ex_panca_inclinata, 24, 6),
      (7, ex_panca_inclinata, 14, 15),
      (8, ex_curl_cavi, 25, 8), (9, ex_curl_cavi, 25, 8), (10, ex_curl_cavi, 25, 8),
      (11, ex_row_cavi, 80, 8), (12, ex_row_cavi, 80, 8), (13, ex_row_cavi, 80, 8),
      (14, ex_push_down, 25, 10), (15, ex_push_down, 25, 10), (16, ex_push_down, 25, 10)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-07-04' AND e.id = v.ex_id;

  -- 06/07/26 — PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-06', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_panca_piana, 30, 8), (2, ex_panca_piana, 30, 8), (3, ex_panca_piana, 30, 6),
      (4, ex_curl_bilanciere, 25, 8), (5, ex_curl_bilanciere, 25, 8), (6, ex_curl_bilanciere, 25, 6),
      (7, ex_alzate_lat_manbubri, 10, 9), (8, ex_alzate_lat_manbubri, 10, 8), (9, ex_alzate_lat_manbubri, 10, 8),
      (10, ex_curl_cavi, 20, 12), (11, ex_curl_cavi, 20, 12), (12, ex_curl_cavi, 20, 12),
      (13, ex_alzate_lat_cavi, 3.75, 12), (14, ex_alzate_lat_cavi, 3.75, 10), (15, ex_alzate_lat_cavi, 3.75, 10)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-07-06' AND e.id = v.ex_id;

  -- 07/07/26 — LEGS (completa)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-07', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps)
  SELECT s.id, e.id, v.set_num, v.weight, v.reps FROM sessions s, exercises e,
    (VALUES
      (1, ex_pressa, 150, 8), (2, ex_pressa, 150, 8), (3, ex_pressa, 150, 6),
      (4, ex_leg_curl, 45, 10), (5, ex_leg_curl, 45, 8), (6, ex_leg_curl, 45, 8),
      (7, ex_adductor, 60, 8), (8, ex_adductor, 60, 8), (9, ex_adductor, 60, 8),
      (10, ex_abductor, 70, 8), (11, ex_abductor, 70, 8), (12, ex_abductor, 70, 8),
      (13, ex_leg_extension, 40, 12), (14, ex_leg_extension, 40, 12), (15, ex_leg_extension, 40, 12),
      (16, ex_polpacci, 130, 8), (17, ex_polpacci, 130, 8), (18, ex_polpacci, 130, 8)
    ) AS v(set_num, ex_id, weight, reps)
  WHERE s.date = '2026-07-07' AND e.id = v.ex_id;

END $$;
