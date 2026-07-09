-- ============================================================
-- WORKOUT IMPORT — utente 36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4
-- 19 sessioni · giugno–luglio 2026
-- Template: PUSH / PULL & TRI / LEGS
-- ============================================================

DO $$
DECLARE
  uid uuid := '36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4';

  -- Muscle groups
  mg_petto       uuid;
  mg_spalle      uuid;
  mg_bicipiti    uuid;
  mg_tricipiti   uuid;
  mg_schiena     uuid;
  mg_addominali  uuid;
  mg_gambe       uuid;
  mg_polpacci    uuid;
  mg_glutei      uuid;

  -- Exercises
  ex_panca_piana         uuid;
  ex_panca_inclinata     uuid;
  ex_alzate_lat          uuid;
  ex_alzate_lat_cavi     uuid;
  ex_bic_bilancere_z     uuid;
  ex_bic_cavi_martello   uuid;
  ex_bic_panca_inclinata uuid;
  ex_bic_cavi_pausa      uuid;
  ex_curl_cavo           uuid;
  ex_croci_cavi          uuid;
  ex_lat_machine         uuid;
  ex_low_row             uuid;
  ex_altro_row           uuid;
  ex_french_press        uuid;
  ex_push_down           uuid;
  ex_tri_cavi            uuid;
  ex_abs_machine         uuid;
  ex_affondi_bulgari     uuid;
  ex_leg_curl            uuid;
  ex_rdl                 uuid;
  ex_adductor            uuid;
  ex_abductor            uuid;
  ex_polpacci            uuid;
  ex_pressa              uuid;
  ex_lento_avanti        uuid;
  ex_chest_press         uuid;
  ex_military            uuid;
  ex_leg_extension       uuid;

  -- Templates
  tpl_push     uuid;
  tpl_pull_tri uuid;
  tpl_legs     uuid;

  -- Sessions
  sess_01_06 uuid; sess_04_06 uuid; sess_05_06 uuid;
  sess_08_06 uuid; sess_09_06 uuid; sess_12_06 uuid;
  sess_16_06 uuid; sess_19_06 uuid; sess_20_06 uuid;
  sess_21_06 uuid; sess_22_06 uuid; sess_23_06 uuid;
  sess_26_06 uuid; sess_29_06 uuid; sess_30_06 uuid;
  sess_01_07 uuid; sess_04_07 uuid; sess_06_07 uuid;
  sess_07_07 uuid;

BEGIN

  -- ============================================================
  -- 1. MUSCLE GROUPS (get or create)
  -- ============================================================

  SELECT id INTO mg_petto      FROM muscle_groups WHERE name ILIKE 'petto'       LIMIT 1;
  SELECT id INTO mg_spalle     FROM muscle_groups WHERE name ILIKE 'spalle'      LIMIT 1;
  SELECT id INTO mg_bicipiti   FROM muscle_groups WHERE name ILIKE 'bicipiti'    LIMIT 1;
  SELECT id INTO mg_tricipiti  FROM muscle_groups WHERE name ILIKE 'tricipiti'   LIMIT 1;
  SELECT id INTO mg_schiena    FROM muscle_groups WHERE name ILIKE ANY(ARRAY['schiena','dorso']) LIMIT 1;
  SELECT id INTO mg_addominali FROM muscle_groups WHERE name ILIKE ANY(ARRAY['addominali','addominale','core']) LIMIT 1;
  SELECT id INTO mg_gambe      FROM muscle_groups WHERE name ILIKE ANY(ARRAY['gambe','quadricipiti']) LIMIT 1;
  SELECT id INTO mg_polpacci   FROM muscle_groups WHERE name ILIKE 'polpacci'    LIMIT 1;
  SELECT id INTO mg_glutei     FROM muscle_groups WHERE name ILIKE 'glutei'      LIMIT 1;

  IF mg_petto      IS NULL THEN mg_petto      := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_petto,      'petto');       END IF;
  IF mg_spalle     IS NULL THEN mg_spalle     := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_spalle,     'spalle');      END IF;
  IF mg_bicipiti   IS NULL THEN mg_bicipiti   := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_bicipiti,   'bicipiti');    END IF;
  IF mg_tricipiti  IS NULL THEN mg_tricipiti  := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_tricipiti,  'tricipiti');   END IF;
  IF mg_schiena    IS NULL THEN mg_schiena    := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_schiena,    'schiena');     END IF;
  IF mg_addominali IS NULL THEN mg_addominali := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_addominali, 'addominali');  END IF;
  IF mg_gambe      IS NULL THEN mg_gambe      := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_gambe,      'gambe');       END IF;
  IF mg_polpacci   IS NULL THEN mg_polpacci   := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_polpacci,   'polpacci');    END IF;
  IF mg_glutei     IS NULL THEN mg_glutei     := gen_random_uuid(); INSERT INTO muscle_groups (id, name) VALUES (mg_glutei,     'glutei');      END IF;

  -- ============================================================
  -- 2. EXERCISES (get or create + muscles mapping)
  -- ============================================================

  SELECT id INTO ex_panca_piana FROM exercises WHERE name ILIKE 'panca piana manubri' LIMIT 1;
  IF ex_panca_piana IS NULL THEN
    ex_panca_piana := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_panca_piana, NULL, 'Panca piana manubri', 'manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_panca_piana, mg_petto,     'primary'),
      (ex_panca_piana, mg_spalle,    'secondary'),
      (ex_panca_piana, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_panca_inclinata FROM exercises WHERE name ILIKE 'panca inclinata manubri' LIMIT 1;
  IF ex_panca_inclinata IS NULL THEN
    ex_panca_inclinata := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_panca_inclinata, NULL, 'Panca inclinata manubri', 'manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_panca_inclinata, mg_petto,     'primary'),
      (ex_panca_inclinata, mg_spalle,    'secondary'),
      (ex_panca_inclinata, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_alzate_lat FROM exercises
    WHERE name ILIKE 'alzate laterali' AND (equipment IS NULL OR equipment NOT ILIKE '%cav%') LIMIT 1;
  IF ex_alzate_lat IS NULL THEN
    ex_alzate_lat := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_alzate_lat, NULL, 'Alzate laterali', 'manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat, mg_spalle, 'primary');
  END IF;

  SELECT id INTO ex_alzate_lat_cavi FROM exercises WHERE name ILIKE 'alzate laterali cavi' LIMIT 1;
  IF ex_alzate_lat_cavi IS NULL THEN
    ex_alzate_lat_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_alzate_lat_cavi, NULL, 'Alzate laterali cavi', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_cavi, mg_spalle, 'primary');
  END IF;

  SELECT id INTO ex_bic_bilancere_z FROM exercises WHERE name ILIKE '%bilancere%z%' OR name ILIKE '%bilancere z%' LIMIT 1;
  IF ex_bic_bilancere_z IS NULL THEN
    ex_bic_bilancere_z := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_bic_bilancere_z, NULL, 'Bicipiti bilancere Z', 'bilancere Z');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_bic_bilancere_z, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_bic_cavi_martello FROM exercises WHERE name ILIKE '%martello%cav%' OR name ILIKE '%cavi%martello%' LIMIT 1;
  IF ex_bic_cavi_martello IS NULL THEN
    ex_bic_cavi_martello := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_bic_cavi_martello, NULL, 'Bicipiti cavi a martello', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_bic_cavi_martello, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_bic_panca_inclinata FROM exercises WHERE name ILIKE '%bicipiti%panca inclinata%' LIMIT 1;
  IF ex_bic_panca_inclinata IS NULL THEN
    ex_bic_panca_inclinata := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_bic_panca_inclinata, NULL, 'Bicipiti panca inclinata', 'manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_bic_panca_inclinata, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_bic_cavi_pausa FROM exercises WHERE name ILIKE '%cavi%pausa%' LIMIT 1;
  IF ex_bic_cavi_pausa IS NULL THEN
    ex_bic_cavi_pausa := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_bic_cavi_pausa, NULL, 'Bicipiti cavi con pausa', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_bic_cavi_pausa, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_curl_cavo FROM exercises WHERE name ILIKE 'curl cavo' LIMIT 1;
  IF ex_curl_cavo IS NULL THEN
    ex_curl_cavo := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_curl_cavo, NULL, 'Curl cavo', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_cavo, mg_bicipiti, 'primary');
  END IF;

  SELECT id INTO ex_croci_cavi FROM exercises WHERE name ILIKE 'croci cavi%' LIMIT 1;
  IF ex_croci_cavi IS NULL THEN
    ex_croci_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_croci_cavi, NULL, 'Croci cavi', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_croci_cavi, mg_petto,  'primary'),
      (ex_croci_cavi, mg_spalle, 'secondary');
  END IF;

  SELECT id INTO ex_lat_machine FROM exercises WHERE name ILIKE 'lat machine' LIMIT 1;
  IF ex_lat_machine IS NULL THEN
    ex_lat_machine := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_lat_machine, NULL, 'Lat machine', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_lat_machine, mg_schiena,  'primary'),
      (ex_lat_machine, mg_bicipiti, 'secondary');
  END IF;

  SELECT id INTO ex_low_row FROM exercises WHERE name ILIKE 'low row' LIMIT 1;
  IF ex_low_row IS NULL THEN
    ex_low_row := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_low_row, NULL, 'Low row', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_low_row, mg_schiena,  'primary'),
      (ex_low_row, mg_bicipiti, 'secondary');
  END IF;

  SELECT id INTO ex_altro_row FROM exercises WHERE name ILIKE 'altro row' LIMIT 1;
  IF ex_altro_row IS NULL THEN
    ex_altro_row := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_altro_row, NULL, 'Altro row', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_altro_row, mg_schiena,  'primary'),
      (ex_altro_row, mg_bicipiti, 'secondary');
  END IF;

  SELECT id INTO ex_french_press FROM exercises WHERE name ILIKE 'french press' LIMIT 1;
  IF ex_french_press IS NULL THEN
    ex_french_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_french_press, NULL, 'French press', 'bilancere');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_french_press, mg_tricipiti, 'primary');
  END IF;

  SELECT id INTO ex_push_down FROM exercises WHERE name ILIKE '%push down%' OR name ILIKE '%push%down%' LIMIT 1;
  IF ex_push_down IS NULL THEN
    ex_push_down := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_push_down, NULL, 'Push down', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_push_down, mg_tricipiti, 'primary');
  END IF;

  SELECT id INTO ex_tri_cavi FROM exercises WHERE name ILIKE 'tricipiti cavi' LIMIT 1;
  IF ex_tri_cavi IS NULL THEN
    ex_tri_cavi := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_tri_cavi, NULL, 'Tricipiti cavi', 'cavi');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_tri_cavi, mg_tricipiti, 'primary');
  END IF;

  SELECT id INTO ex_abs_machine FROM exercises WHERE name ILIKE '%abdominal machine%' OR name ILIKE '%addominal%' LIMIT 1;
  IF ex_abs_machine IS NULL THEN
    ex_abs_machine := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_abs_machine, NULL, 'Total abdominal machine', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abs_machine, mg_addominali, 'primary');
  END IF;

  SELECT id INTO ex_affondi_bulgari FROM exercises WHERE name ILIKE '%bulgari%' LIMIT 1;
  IF ex_affondi_bulgari IS NULL THEN
    ex_affondi_bulgari := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_affondi_bulgari, NULL, 'Affondi bulgari', 'manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_affondi_bulgari, mg_gambe,  'primary'),
      (ex_affondi_bulgari, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_leg_curl FROM exercises WHERE name ILIKE 'leg curl' LIMIT 1;
  IF ex_leg_curl IS NULL THEN
    ex_leg_curl := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_leg_curl, NULL, 'Leg curl', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_curl, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_rdl FROM exercises WHERE name ILIKE 'rdl' OR name ILIKE 'romanian deadlift' LIMIT 1;
  IF ex_rdl IS NULL THEN
    ex_rdl := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_rdl, NULL, 'RDL', 'bilancere');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_rdl, mg_gambe,  'primary'),
      (ex_rdl, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_adductor FROM exercises WHERE name ILIKE 'adductor' OR name ILIKE 'adduttori' LIMIT 1;
  IF ex_adductor IS NULL THEN
    ex_adductor := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_adductor, NULL, 'Adductor', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_adductor, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_abductor FROM exercises WHERE name ILIKE 'abductor' OR name ILIKE 'abduttori' LIMIT 1;
  IF ex_abductor IS NULL THEN
    ex_abductor := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_abductor, NULL, 'Abductor', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abductor, mg_gambe, 'primary');
  END IF;

  SELECT id INTO ex_polpacci FROM exercises WHERE name ILIKE 'polpacci' OR name ILIKE 'calf%' LIMIT 1;
  IF ex_polpacci IS NULL THEN
    ex_polpacci := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_polpacci, NULL, 'Polpacci', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_polpacci, mg_polpacci, 'primary');
  END IF;

  SELECT id INTO ex_pressa FROM exercises WHERE name ILIKE 'pressa' OR name ILIKE 'leg press' LIMIT 1;
  IF ex_pressa IS NULL THEN
    ex_pressa := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_pressa, NULL, 'Pressa', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_pressa, mg_gambe,  'primary'),
      (ex_pressa, mg_glutei, 'secondary');
  END IF;

  SELECT id INTO ex_lento_avanti FROM exercises WHERE name ILIKE 'lento avanti' OR name ILIKE 'shoulder press' LIMIT 1;
  IF ex_lento_avanti IS NULL THEN
    ex_lento_avanti := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_lento_avanti, NULL, 'Lento avanti', 'manubri');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_lento_avanti, mg_spalle,    'primary'),
      (ex_lento_avanti, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_chest_press FROM exercises WHERE name ILIKE 'chest press' LIMIT 1;
  IF ex_chest_press IS NULL THEN
    ex_chest_press := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_chest_press, NULL, 'Chest press', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_chest_press, mg_petto,     'primary'),
      (ex_chest_press, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_military FROM exercises WHERE name ILIKE '%military%multipower%' OR name ILIKE 'military press%' LIMIT 1;
  IF ex_military IS NULL THEN
    ex_military := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_military, NULL, 'Military press multipower', 'multipower');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
      (ex_military, mg_spalle,    'primary'),
      (ex_military, mg_tricipiti, 'secondary');
  END IF;

  SELECT id INTO ex_leg_extension FROM exercises WHERE name ILIKE 'leg extension' LIMIT 1;
  IF ex_leg_extension IS NULL THEN
    ex_leg_extension := gen_random_uuid();
    INSERT INTO exercises (id, user_id, name, equipment) VALUES (ex_leg_extension, NULL, 'Leg extension', 'macchina');
    INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_extension, mg_gambe, 'primary');
  END IF;

  -- ============================================================
  -- 3. TEMPLATES
  -- ============================================================

  tpl_push := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_push, uid, 'PUSH — Petto · Spalle · Bicipiti');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_push, ex_panca_piana,       3, 8,  0),
    (tpl_push, ex_alzate_lat,        3, 10, 1),
    (tpl_push, ex_bic_bilancere_z,   3, 8,  2),
    (tpl_push, ex_croci_cavi,        3, 12, 3),
    (tpl_push, ex_alzate_lat_cavi,   3, 12, 4),
    (tpl_push, ex_bic_cavi_martello, 3, 12, 5);

  tpl_pull_tri := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_pull_tri, uid, 'PULL & TRI — Schiena · Tricipiti');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_pull_tri, ex_lat_machine,  3, 8,  0),
    (tpl_pull_tri, ex_low_row,      3, 8,  1),
    (tpl_pull_tri, ex_french_press, 3, 10, 2),
    (tpl_pull_tri, ex_altro_row,    3, 12, 3),
    (tpl_pull_tri, ex_push_down,    3, 12, 4),
    (tpl_pull_tri, ex_abs_machine,  3, 8,  5);

  tpl_legs := gen_random_uuid();
  INSERT INTO workout_templates (id, user_id, name) VALUES (tpl_legs, uid, 'LEGS — Gambe');
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_legs, ex_pressa,   3, 8,  0),
    (tpl_legs, ex_leg_curl, 3, 12, 1),
    (tpl_legs, ex_rdl,      3, 12, 2),
    (tpl_legs, ex_adductor, 3, 10, 3),
    (tpl_legs, ex_polpacci, 3, 8,  4);

  -- ============================================================
  -- 4. SESSIONS + SETS
  -- ============================================================

  -- 01/06/26 — PUSH
  sess_01_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_01_06, uid, '2026-06-01', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_01_06, ex_panca_piana,       1,  30,    7),
    (sess_01_06, ex_panca_piana,       2,  30,    7),
    (sess_01_06, ex_panca_piana,       3,  30,    5),
    (sess_01_06, ex_alzate_lat,        4,  10,   10),
    (sess_01_06, ex_alzate_lat,        5,  10,   10),
    (sess_01_06, ex_alzate_lat,        6,  10,   10),
    (sess_01_06, ex_bic_bilancere_z,   7,  25,    7),
    (sess_01_06, ex_bic_bilancere_z,   8,  25,    7),
    (sess_01_06, ex_bic_bilancere_z,   9,  25,    6),
    (sess_01_06, ex_alzate_lat_cavi,   10, 3.75, 12),
    (sess_01_06, ex_alzate_lat_cavi,   11, 3.75, 12),
    (sess_01_06, ex_alzate_lat_cavi,   12, 3.75, 12),
    (sess_01_06, ex_bic_cavi_martello, 13, 20,   12),
    (sess_01_06, ex_bic_cavi_martello, 14, 20,   10),
    (sess_01_06, ex_bic_cavi_martello, 15, 20,   10);

  -- 04/06/26 — PULL & TRI
  sess_04_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_04_06, uid, '2026-06-04', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_04_06, ex_lat_machine,  1,  80, 8),
    (sess_04_06, ex_lat_machine,  2,  80, 8),
    (sess_04_06, ex_lat_machine,  3,  80, 5),
    (sess_04_06, ex_low_row,      4,  80, 8),
    (sess_04_06, ex_low_row,      5,  80, 8),
    (sess_04_06, ex_low_row,      6,  80, 8),
    (sess_04_06, ex_french_press, 7,  25, 10),
    (sess_04_06, ex_french_press, 8,  25, 10),
    (sess_04_06, ex_french_press, 9,  25, 8),
    (sess_04_06, ex_altro_row,    10, 60, 10),
    (sess_04_06, ex_altro_row,    11, 60, 10),
    (sess_04_06, ex_altro_row,    12, 60, 10),
    (sess_04_06, ex_push_down,    13, 17, 12),
    (sess_04_06, ex_push_down,    14, 17, 12),
    (sess_04_06, ex_push_down,    15, 17, 12),
    (sess_04_06, ex_abs_machine,  16, 60, 8),
    (sess_04_06, ex_abs_machine,  17, 60, 8),
    (sess_04_06, ex_abs_machine,  18, 60, 8);

  -- 05/06/26 — LEGS
  sess_05_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_05_06, uid, '2026-06-05', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_05_06, ex_affondi_bulgari, 1,  12,  8),
    (sess_05_06, ex_affondi_bulgari, 2,  12,  8),
    (sess_05_06, ex_affondi_bulgari, 3,  12,  8),
    (sess_05_06, ex_leg_curl,        4,  40, 12),
    (sess_05_06, ex_leg_curl,        5,  40, 12),
    (sess_05_06, ex_leg_curl,        6,  40, 12),
    (sess_05_06, ex_rdl,             7,  40, 12),
    (sess_05_06, ex_rdl,             8,  40, 12),
    (sess_05_06, ex_rdl,             9,  40, 12),
    (sess_05_06, ex_adductor,        10, 60, 10),
    (sess_05_06, ex_adductor,        11, 60, 10),
    (sess_05_06, ex_adductor,        12, 60, 10),
    (sess_05_06, ex_abductor,        13, 50,  8),
    (sess_05_06, ex_abductor,        14, 50,  8),
    (sess_05_06, ex_polpacci,        15, 130,  8),
    (sess_05_06, ex_polpacci,        16, 130,  8),
    (sess_05_06, ex_polpacci,        17, 130,  8);

  -- 08/06/26 — PUSH
  sess_08_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_08_06, uid, '2026-06-08', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_08_06, ex_panca_piana,       1,  30,    8),
    (sess_08_06, ex_panca_piana,       2,  30,    7),
    (sess_08_06, ex_panca_piana,       3,  30,    6),
    (sess_08_06, ex_alzate_lat,        4,  10,   10),
    (sess_08_06, ex_alzate_lat,        5,  10,   10),
    (sess_08_06, ex_alzate_lat,        6,  10,   10),
    (sess_08_06, ex_bic_bilancere_z,   7,  25,    7),
    (sess_08_06, ex_bic_bilancere_z,   8,  25,    7),
    (sess_08_06, ex_bic_bilancere_z,   9,  25,    6),
    (sess_08_06, ex_croci_cavi,        10, 7.5,  12),
    (sess_08_06, ex_croci_cavi,        11, 7.5,  12),
    (sess_08_06, ex_croci_cavi,        12, 7.5,  12),
    (sess_08_06, ex_alzate_lat_cavi,   13, 3.75, 12),
    (sess_08_06, ex_alzate_lat_cavi,   14, 3.75, 12),
    (sess_08_06, ex_alzate_lat_cavi,   15, 3.75, 12),
    (sess_08_06, ex_bic_cavi_martello, 16, 20,   12),
    (sess_08_06, ex_bic_cavi_martello, 17, 20,   10),
    (sess_08_06, ex_bic_cavi_martello, 18, 20,   10);

  -- 09/06/26 — PULL & TRI (senza lat machine)
  sess_09_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_09_06, uid, '2026-06-09', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_09_06, ex_low_row,      1,  80,  8),
    (sess_09_06, ex_low_row,      2,  80,  8),
    (sess_09_06, ex_low_row,      3,  80,  8),
    (sess_09_06, ex_french_press, 4,  25, 10),
    (sess_09_06, ex_french_press, 5,  25, 10),
    (sess_09_06, ex_french_press, 6,  25, 10),
    (sess_09_06, ex_altro_row,    7,  60, 12),
    (sess_09_06, ex_altro_row,    8,  60, 12),
    (sess_09_06, ex_altro_row,    9,  60, 12),
    (sess_09_06, ex_push_down,    10, 17, 12),
    (sess_09_06, ex_push_down,    11, 17, 12),
    (sess_09_06, ex_push_down,    12, 17, 12),
    (sess_09_06, ex_abs_machine,  13, 60,  8),
    (sess_09_06, ex_abs_machine,  14, 60,  8),
    (sess_09_06, ex_abs_machine,  15, 60,  8);

  -- 12/06/26 — LEGS
  sess_12_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_12_06, uid, '2026-06-12', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_12_06, ex_affondi_bulgari, 1,  14,  8),
    (sess_12_06, ex_affondi_bulgari, 2,  14,  8),
    (sess_12_06, ex_affondi_bulgari, 3,  14,  8),
    (sess_12_06, ex_adductor,        4,  60,  8),
    (sess_12_06, ex_adductor,        5,  60,  8),
    (sess_12_06, ex_adductor,        6,  60,  8),
    (sess_12_06, ex_rdl,             7,  50, 12),
    (sess_12_06, ex_rdl,             8,  50, 12),
    (sess_12_06, ex_rdl,             9,  50, 12),
    (sess_12_06, ex_leg_curl,        10, 30, 12),
    (sess_12_06, ex_leg_curl,        11, 30, 12),
    (sess_12_06, ex_leg_curl,        12, 30, 12),
    (sess_12_06, ex_polpacci,        13, 130, 8),
    (sess_12_06, ex_polpacci,        14, 130, 8),
    (sess_12_06, ex_polpacci,        15, 130, 8);

  -- 16/06/26 — PUSH (variante bicipiti inclinata)
  sess_16_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_16_06, uid, '2026-06-16', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_16_06, ex_panca_piana,          1,  30,    8),
    (sess_16_06, ex_panca_piana,          2,  30,    7),
    (sess_16_06, ex_panca_piana,          3,  30,    6),
    (sess_16_06, ex_alzate_lat,           4,  10,   10),
    (sess_16_06, ex_alzate_lat,           5,  10,   10),
    (sess_16_06, ex_alzate_lat,           6,  10,   10),
    (sess_16_06, ex_bic_panca_inclinata,  7,  14,    8),
    (sess_16_06, ex_bic_panca_inclinata,  8,  14,    8),
    (sess_16_06, ex_bic_panca_inclinata,  9,  14,    8),
    (sess_16_06, ex_croci_cavi,           10, 7.5,  12),
    (sess_16_06, ex_croci_cavi,           11, 7.5,  12),
    (sess_16_06, ex_croci_cavi,           12, 7.5,  12),
    (sess_16_06, ex_alzate_lat_cavi,      13, 3.75, 12),
    (sess_16_06, ex_alzate_lat_cavi,      14, 3.75, 12),
    (sess_16_06, ex_alzate_lat_cavi,      15, 3.75, 12),
    (sess_16_06, ex_bic_cavi_pausa,       16, 22,   12),
    (sess_16_06, ex_bic_cavi_pausa,       17, 22,   12),
    (sess_16_06, ex_bic_cavi_pausa,       18, 22,   12);

  -- 19/06/26 — PULL & TRI
  sess_19_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_19_06, uid, '2026-06-19', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_19_06, ex_french_press, 1,  27,    10),
    (sess_19_06, ex_french_press, 2,  27,    10),
    (sess_19_06, ex_french_press, 3,  27,     6),
    (sess_19_06, ex_low_row,      4,  80,    10),
    (sess_19_06, ex_low_row,      5,  80,    10),
    (sess_19_06, ex_low_row,      6,  80,     6),
    (sess_19_06, ex_push_down,    7,  22.5,  12),
    (sess_19_06, ex_push_down,    8,  22.5,  12),
    (sess_19_06, ex_push_down,    9,  22.5,  12),
    (sess_19_06, ex_altro_row,    10, 60,    12),
    (sess_19_06, ex_altro_row,    11, 60,    12),
    (sess_19_06, ex_altro_row,    12, 60,    12),
    (sess_19_06, ex_abs_machine,  13, 60,     8),
    (sess_19_06, ex_abs_machine,  14, 60,     8),
    (sess_19_06, ex_abs_machine,  15, 60,     8);

  -- 20/06/26 — LEGS + ABS
  sess_20_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_20_06, uid, '2026-06-20', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_20_06, ex_affondi_bulgari, 1,  14,  8),
    (sess_20_06, ex_affondi_bulgari, 2,  14,  8),
    (sess_20_06, ex_affondi_bulgari, 3,  14,  8),
    (sess_20_06, ex_rdl,             4,  50, 12),
    (sess_20_06, ex_rdl,             5,  50, 12),
    (sess_20_06, ex_rdl,             6,  50, 12),
    (sess_20_06, ex_leg_curl,        7,  30, 12),
    (sess_20_06, ex_leg_curl,        8,  30, 12),
    (sess_20_06, ex_leg_curl,        9,  30, 12),
    (sess_20_06, ex_adductor,        10, 60,  8),
    (sess_20_06, ex_adductor,        11, 60,  8),
    (sess_20_06, ex_adductor,        12, 60,  8),
    (sess_20_06, ex_polpacci,        13, 130, 8),
    (sess_20_06, ex_polpacci,        14, 130, 8),
    (sess_20_06, ex_polpacci,        15, 130, 8),
    (sess_20_06, ex_abs_machine,     16, 60,  8),
    (sess_20_06, ex_abs_machine,     17, 60,  8),
    (sess_20_06, ex_abs_machine,     18, 60,  8);

  -- 21/06/26 — PUSH (panca 30° inclinata)
  sess_21_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_21_06, uid, '2026-06-21', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_21_06, ex_panca_inclinata,   1,  26,    6),
    (sess_21_06, ex_panca_inclinata,   2,  26,    6),
    (sess_21_06, ex_panca_inclinata,   3,  26,    6),
    (sess_21_06, ex_bic_bilancere_z,   4,  25,    8),
    (sess_21_06, ex_bic_bilancere_z,   5,  25,    7),
    (sess_21_06, ex_bic_bilancere_z,   6,  25,    7),
    (sess_21_06, ex_alzate_lat,        7,  10,   10),
    (sess_21_06, ex_alzate_lat,        8,  10,   10),
    (sess_21_06, ex_alzate_lat,        9,  10,   10),
    (sess_21_06, ex_croci_cavi,        10, 7.5,  12),
    (sess_21_06, ex_croci_cavi,        11, 7.5,  12),
    (sess_21_06, ex_croci_cavi,        12, 7.5,  12),
    (sess_21_06, ex_alzate_lat_cavi,   13, 3.75, 12),
    (sess_21_06, ex_alzate_lat_cavi,   14, 3.75, 10),
    (sess_21_06, ex_alzate_lat_cavi,   15, 3.75, 10),
    (sess_21_06, ex_bic_cavi_martello, 16, 20,   12),
    (sess_21_06, ex_bic_cavi_martello, 17, 20,   10),
    (sess_21_06, ex_bic_cavi_martello, 18, 20,   10);

  -- 22/06/26 — PULL & TRI
  sess_22_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_22_06, uid, '2026-06-22', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_22_06, ex_low_row,      1,  80,    10),
    (sess_22_06, ex_low_row,      2,  80,    10),
    (sess_22_06, ex_low_row,      3,  80,     8),
    (sess_22_06, ex_french_press, 4,  25,    10),
    (sess_22_06, ex_french_press, 5,  25,    10),
    (sess_22_06, ex_french_press, 6,  25,     6),
    (sess_22_06, ex_altro_row,    7,  60,    12),
    (sess_22_06, ex_altro_row,    8,  60,    12),
    (sess_22_06, ex_altro_row,    9,  60,    12),
    (sess_22_06, ex_push_down,    10, 17.5,  12),
    (sess_22_06, ex_push_down,    11, 17.5,  12),
    (sess_22_06, ex_push_down,    12, 17.5,  12),
    (sess_22_06, ex_abs_machine,  13, 60,     8),
    (sess_22_06, ex_abs_machine,  14, 60,     8),
    (sess_22_06, ex_abs_machine,  15, 60,     8);

  -- 23/06/26 — LEGS (con pressa, leg curl senza peso)
  sess_23_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_23_06, uid, '2026-06-23', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_23_06, ex_pressa,   1,  150, 8),
    (sess_23_06, ex_pressa,   2,  150, 8),
    (sess_23_06, ex_pressa,   3,  150, 6),
    (sess_23_06, ex_adductor, 4,  60,  8),
    (sess_23_06, ex_adductor, 5,  60,  8),
    (sess_23_06, ex_adductor, 6,  60,  8),
    (sess_23_06, ex_leg_curl, 7,  0,   8),
    (sess_23_06, ex_leg_curl, 8,  0,   8),
    (sess_23_06, ex_leg_curl, 9,  0,   8),
    (sess_23_06, ex_rdl,      10, 50,  8),
    (sess_23_06, ex_rdl,      11, 50,  8),
    (sess_23_06, ex_rdl,      12, 50,  8),
    (sess_23_06, ex_polpacci, 13, 130, 8),
    (sess_23_06, ex_polpacci, 14, 130, 8),
    (sess_23_06, ex_polpacci, 15, 130, 8);

  -- 26/06/26 — SPALLE (sessione libera)
  sess_26_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_26_06, uid, '2026-06-26', NULL);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_26_06, ex_alzate_lat,      1,  10,    10),
    (sess_26_06, ex_alzate_lat,      2,  10,    10),
    (sess_26_06, ex_alzate_lat,      3,  10,    10),
    (sess_26_06, ex_lento_avanti,    4,  20,    10),
    (sess_26_06, ex_lento_avanti,    5,  20,     9),
    (sess_26_06, ex_lento_avanti,    6,  20,     8),
    (sess_26_06, ex_alzate_lat_cavi, 7,  3.75,  10),
    (sess_26_06, ex_alzate_lat_cavi, 8,  3.75,  10),
    (sess_26_06, ex_alzate_lat_cavi, 9,  3.75,  10),
    (sess_26_06, ex_low_row,         10, 80,    10),
    (sess_26_06, ex_low_row,         11, 80,    10),
    (sess_26_06, ex_low_row,         12, 80,    10),
    (sess_26_06, ex_chest_press,     13, 50,    10),
    (sess_26_06, ex_chest_press,     14, 50,    10),
    (sess_26_06, ex_chest_press,     15, 50,    10),
    (sess_26_06, ex_tri_cavi,        16, 15,    10),
    (sess_26_06, ex_tri_cavi,        17, 20,    10),
    (sess_26_06, ex_tri_cavi,        18, 20,    10),
    (sess_26_06, ex_abs_machine,     19, 60,     8),
    (sess_26_06, ex_abs_machine,     20, 60,     8),
    (sess_26_06, ex_abs_machine,     21, 60,     8);

  -- 29/06/26 — PUSH (sessione corta)
  sess_29_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_29_06, uid, '2026-06-29', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_29_06, ex_panca_piana,     1,  30,    6),
    (sess_29_06, ex_panca_piana,     2,  30,    6),
    (sess_29_06, ex_panca_piana,     3,  30,    6),
    (sess_29_06, ex_croci_cavi,      4,  5,    12),
    (sess_29_06, ex_croci_cavi,      5,  5,    12),
    (sess_29_06, ex_croci_cavi,      6,  5,    12),
    (sess_29_06, ex_alzate_lat,      7,  10,   10),
    (sess_29_06, ex_alzate_lat,      8,  10,   10),
    (sess_29_06, ex_alzate_lat,      9,  10,   10),
    (sess_29_06, ex_alzate_lat_cavi, 10, 3.75, 12),
    (sess_29_06, ex_alzate_lat_cavi, 11, 3.75, 10),
    (sess_29_06, ex_alzate_lat_cavi, 12, 3.75, 10);

  -- 30/06/26 — PULL & TRI
  sess_30_06 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_30_06, uid, '2026-06-30', tpl_pull_tri);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_30_06, ex_low_row,      1,  80, 10),
    (sess_30_06, ex_low_row,      2,  80, 10),
    (sess_30_06, ex_low_row,      3,  80, 10),
    (sess_30_06, ex_french_press, 4,  27,  8),
    (sess_30_06, ex_french_press, 5,  27,  8),
    (sess_30_06, ex_french_press, 6,  27,  8),
    (sess_30_06, ex_altro_row,    7,  60, 12),
    (sess_30_06, ex_altro_row,    8,  70, 12),
    (sess_30_06, ex_altro_row,    9,  70, 12),
    (sess_30_06, ex_push_down,    10, 20, 12),
    (sess_30_06, ex_push_down,    11, 20, 12),
    (sess_30_06, ex_push_down,    12, 20, 12),
    (sess_30_06, ex_abs_machine,  13, 60,  8),
    (sess_30_06, ex_abs_machine,  14, 60,  8),
    (sess_30_06, ex_abs_machine,  15, 60,  8);

  -- 01/07/26 — LEGS + MILITARY (sessione mista)
  sess_01_07 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_01_07, uid, '2026-07-01', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_01_07, ex_pressa,   1,  150,  8),
    (sess_01_07, ex_pressa,   2,  150,  8),
    (sess_01_07, ex_pressa,   3,  150,  6),
    (sess_01_07, ex_rdl,      4,  50,  10),
    (sess_01_07, ex_rdl,      5,  50,  10),
    (sess_01_07, ex_rdl,      6,  50,  10),
    (sess_01_07, ex_military, 7,  40,   8),
    (sess_01_07, ex_military, 8,  40,   8),
    (sess_01_07, ex_military, 9,  40,   8),
    (sess_01_07, ex_leg_curl, 10, 0,    8),
    (sess_01_07, ex_leg_curl, 11, 0,    8),
    (sess_01_07, ex_leg_curl, 12, 0,    8),
    (sess_01_07, ex_polpacci, 13, 130,  8),
    (sess_01_07, ex_polpacci, 14, 130,  8),
    (sess_01_07, ex_polpacci, 15, 130,  8);

  -- 04/07/26 — SESSIONE MISTA (sessione libera)
  sess_04_07 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_04_07, uid, '2026-07-04', NULL);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_04_07, ex_alzate_lat,      1,  10,  10),
    (sess_04_07, ex_alzate_lat,      2,  10,  10),
    (sess_04_07, ex_alzate_lat,      3,  10,  10),
    (sess_04_07, ex_panca_inclinata, 4,  24,   8),
    (sess_04_07, ex_panca_inclinata, 5,  24,   6),
    (sess_04_07, ex_panca_inclinata, 6,  24,   6),
    (sess_04_07, ex_panca_inclinata, 7,  14,  15), -- 1x max a 14kg
    (sess_04_07, ex_curl_cavo,       8,  25,   8),
    (sess_04_07, ex_curl_cavo,       9,  25,   8),
    (sess_04_07, ex_curl_cavo,       10, 25,   8),
    (sess_04_07, ex_low_row,         11, 80,   8),
    (sess_04_07, ex_low_row,         12, 80,   8),
    (sess_04_07, ex_low_row,         13, 80,   8),
    (sess_04_07, ex_push_down,       14, 25,  10),
    (sess_04_07, ex_push_down,       15, 25,  10),
    (sess_04_07, ex_push_down,       16, 25,  10);

  -- 06/07/26 — PUSH
  sess_06_07 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_06_07, uid, '2026-07-06', tpl_push);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_06_07, ex_panca_piana,       1,  30,    8),
    (sess_06_07, ex_panca_piana,       2,  30,    8),
    (sess_06_07, ex_panca_piana,       3,  30,    6),
    (sess_06_07, ex_bic_bilancere_z,   4,  25,    8),
    (sess_06_07, ex_bic_bilancere_z,   5,  25,    8),
    (sess_06_07, ex_bic_bilancere_z,   6,  25,    6),
    (sess_06_07, ex_alzate_lat,        7,  10,    9),
    (sess_06_07, ex_alzate_lat,        8,  10,    8),
    (sess_06_07, ex_alzate_lat,        9,  10,    8),
    (sess_06_07, ex_bic_cavi_martello, 10, 20,   12),
    (sess_06_07, ex_bic_cavi_martello, 11, 20,   12),
    (sess_06_07, ex_bic_cavi_martello, 12, 20,   12),
    (sess_06_07, ex_alzate_lat_cavi,   13, 3.75, 12),
    (sess_06_07, ex_alzate_lat_cavi,   14, 3.75, 10),
    (sess_06_07, ex_alzate_lat_cavi,   15, 3.75, 10);

  -- 07/07/26 — LEGS (completa)
  sess_07_07 := gen_random_uuid();
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (sess_07_07, uid, '2026-07-07', tpl_legs);
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_07_07, ex_pressa,        1,  150,  8),
    (sess_07_07, ex_pressa,        2,  150,  8),
    (sess_07_07, ex_pressa,        3,  150,  6),
    (sess_07_07, ex_leg_curl,      4,  45,  10),
    (sess_07_07, ex_leg_curl,      5,  45,   8),
    (sess_07_07, ex_leg_curl,      6,  45,   8),
    (sess_07_07, ex_adductor,      7,  60,   8),
    (sess_07_07, ex_adductor,      8,  60,   8),
    (sess_07_07, ex_adductor,      9,  60,   8),
    (sess_07_07, ex_abductor,      10, 70,   8),
    (sess_07_07, ex_abductor,      11, 70,   8),
    (sess_07_07, ex_abductor,      12, 70,   8),
    (sess_07_07, ex_leg_extension, 13, 40,  12),
    (sess_07_07, ex_leg_extension, 14, 40,  12),
    (sess_07_07, ex_leg_extension, 15, 40,  12),
    (sess_07_07, ex_polpacci,      16, 130,  8),
    (sess_07_07, ex_polpacci,      17, 130,  8),
    (sess_07_07, ex_polpacci,      18, 130,  8);

END $$;
