-- ============================================================
-- COMPLETE IMPORT — user 36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4
-- Esercizi + Mapping + Template + Sessioni (19 complete)
-- ============================================================

DO $$
DECLARE
  uid uuid := '36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4';

  -- Equipment type IDs
  eq_manubri uuid;
  eq_bilanciere uuid;
  eq_bilanciere_z uuid;
  eq_cavi uuid;
  eq_macchina uuid;
  eq_multipower uuid;

  -- Muscle group IDs (from existing data)
  mg_petto uuid := '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a';
  mg_spalle uuid := 'ee31242d-e015-437e-82f5-98047d9eaf1a';
  mg_bicipiti uuid := '89a58787-8d20-4398-a57e-a219ef1c470f';
  mg_tricipiti uuid := '80fdafca-2fd6-4485-a63a-a99bb3ca73de';
  mg_dorso uuid := '86e49537-548a-4c0c-bc7c-69dd28e72b41';
  mg_core uuid := '6451139b-1a47-4650-8ea3-927d5a06628c';
  mg_quadricipiti uuid := '67f07249-c145-43a7-a1be-d2a6227b283c';
  mg_femorali uuid := '963fba48-53da-4240-99aa-51aec8d6bed9';
  mg_glutei uuid := 'f2102e8c-d015-437e-82f5-98047d9eaf1a';
  mg_polpacci uuid := '29d8f01c-3ab0-4d96-8001-95b308955a64';
  mg_avambracci uuid := 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80';

  -- Exercise IDs
  ex_panca_piana uuid; ex_panca_inclinata uuid; ex_croci uuid; ex_chest_press uuid;
  ex_alzate_lat_manubri uuid; ex_alzate_lat_cavi uuid; ex_lento_avanti uuid; ex_military_press uuid;
  ex_curl_bilanciere uuid; ex_curl_cavi uuid; ex_curl_manubri uuid;
  ex_lat_machine uuid; ex_row uuid;
  ex_french_press uuid; ex_push_down uuid; ex_abdominal_machine uuid;
  ex_affondi_bulgari uuid; ex_pressa uuid; ex_rdl uuid; ex_leg_curl uuid; ex_leg_extension uuid;
  ex_adductor uuid; ex_abductor uuid; ex_polpacci uuid;

  -- Templates
  tpl_push uuid; tpl_pull_tri uuid; tpl_legs uuid;
  sess_id uuid;

BEGIN

  -- ============================================================
  -- 1. Get Equipment Type IDs
  -- ============================================================
  SELECT id INTO eq_manubri FROM equipment_types WHERE name = 'Manubri';
  SELECT id INTO eq_bilanciere FROM equipment_types WHERE name = 'Bilanciere';
  SELECT id INTO eq_bilanciere_z FROM equipment_types WHERE name = 'Bilanciere Z';
  SELECT id INTO eq_cavi FROM equipment_types WHERE name = 'Cavi';
  SELECT id INTO eq_macchina FROM equipment_types WHERE name = 'Macchina';
  SELECT id INTO eq_multipower FROM equipment_types WHERE name = 'Multipower';

  -- ============================================================
  -- 2. INSERT EXERCISES (21 total)
  -- ============================================================

  -- PETTO
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Panca piana', eq_manubri) RETURNING id INTO ex_panca_piana;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_panca_piana, mg_petto, 'primary'), (ex_panca_piana, mg_spalle, 'secondary'), (ex_panca_piana, mg_tricipiti, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Panca inclinata', eq_manubri) RETURNING id INTO ex_panca_inclinata;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_panca_inclinata, mg_petto, 'primary'), (ex_panca_inclinata, mg_spalle, 'secondary'), (ex_panca_inclinata, mg_tricipiti, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Croci', eq_cavi) RETURNING id INTO ex_croci;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_croci, mg_petto, 'primary'), (ex_croci, mg_spalle, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Chest press', eq_macchina) RETURNING id INTO ex_chest_press;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_chest_press, mg_petto, 'primary'), (ex_chest_press, mg_tricipiti, 'secondary');

  -- SPALLE
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Alzate laterali', eq_manubri) RETURNING id INTO ex_alzate_lat_manubri;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_manubri, mg_spalle, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Alzate laterali', eq_cavi) RETURNING id INTO ex_alzate_lat_cavi;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_alzate_lat_cavi, mg_spalle, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Lento avanti', eq_manubri) RETURNING id INTO ex_lento_avanti;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_lento_avanti, mg_spalle, 'primary'), (ex_lento_avanti, mg_tricipiti, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Military press', eq_multipower) RETURNING id INTO ex_military_press;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_military_press, mg_spalle, 'primary'), (ex_military_press, mg_tricipiti, 'secondary');

  -- BICIPITI (3 varianti)
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Curl', eq_bilanciere_z) RETURNING id INTO ex_curl_bilanciere;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_bilanciere, mg_bicipiti, 'primary'), (ex_curl_bilanciere, mg_avambracci, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Curl', eq_cavi) RETURNING id INTO ex_curl_cavi;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_cavi, mg_bicipiti, 'primary'), (ex_curl_cavi, mg_avambracci, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Curl', eq_manubri) RETURNING id INTO ex_curl_manubri;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_curl_manubri, mg_bicipiti, 'primary'), (ex_curl_manubri, mg_avambracci, 'secondary');

  -- DORSO (SCHIENA)
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Lat machine', eq_macchina) RETURNING id INTO ex_lat_machine;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_lat_machine, mg_dorso, 'primary'), (ex_lat_machine, mg_bicipiti, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Row', eq_cavi) RETURNING id INTO ex_row;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_row, mg_dorso, 'primary'), (ex_row, mg_bicipiti, 'secondary');

  -- TRICIPITI
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'French press', eq_bilanciere) RETURNING id INTO ex_french_press;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_french_press, mg_tricipiti, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Push down', eq_cavi) RETURNING id INTO ex_push_down;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_push_down, mg_tricipiti, 'primary');

  -- CORE
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Abdominal machine', eq_macchina) RETURNING id INTO ex_abdominal_machine;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abdominal_machine, mg_core, 'primary');

  -- GAMBE
  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Affondi bulgari', eq_manubri) RETURNING id INTO ex_affondi_bulgari;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_affondi_bulgari, mg_quadricipiti, 'primary'), (ex_affondi_bulgari, mg_glutei, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Pressa', eq_macchina) RETURNING id INTO ex_pressa;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_pressa, mg_quadricipiti, 'primary'), (ex_pressa, mg_glutei, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'RDL', eq_bilanciere) RETURNING id INTO ex_rdl;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_rdl, mg_femorali, 'primary'), (ex_rdl, mg_glutei, 'secondary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Leg curl', eq_macchina) RETURNING id INTO ex_leg_curl;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_curl, mg_femorali, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Leg extension', eq_macchina) RETURNING id INTO ex_leg_extension;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_leg_extension, mg_quadricipiti, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Adductor', eq_macchina) RETURNING id INTO ex_adductor;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_adductor, mg_quadricipiti, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Abductor', eq_macchina) RETURNING id INTO ex_abductor;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_abductor, mg_quadricipiti, 'primary');

  INSERT INTO exercises (id, user_id, name, equipment_id)
  VALUES (gen_random_uuid(), NULL, 'Polpacci', eq_macchina) RETURNING id INTO ex_polpacci;
  INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (ex_polpacci, mg_polpacci, 'primary');

  -- ============================================================
  -- 3. CREATE TEMPLATES
  -- ============================================================

  INSERT INTO workout_templates (id, user_id, name) VALUES (gen_random_uuid(), uid, 'PUSH — Petto · Spalle · Bicipiti') RETURNING id INTO tpl_push;
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_push, ex_panca_piana, 3, 8, 0),
    (tpl_push, ex_alzate_lat_manubri, 3, 10, 1),
    (tpl_push, ex_curl_bilanciere, 3, 8, 2),
    (tpl_push, ex_croci, 3, 12, 3),
    (tpl_push, ex_alzate_lat_cavi, 3, 12, 4),
    (tpl_push, ex_curl_cavi, 3, 12, 5);

  INSERT INTO workout_templates (id, user_id, name) VALUES (gen_random_uuid(), uid, 'PULL & TRI — Dorso · Tricipiti') RETURNING id INTO tpl_pull_tri;
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_pull_tri, ex_lat_machine, 3, 8, 0),
    (tpl_pull_tri, ex_row, 3, 8, 1),
    (tpl_pull_tri, ex_french_press, 3, 10, 2),
    (tpl_pull_tri, ex_push_down, 3, 12, 3),
    (tpl_pull_tri, ex_curl_cavi, 3, 12, 4),
    (tpl_pull_tri, ex_abdominal_machine, 3, 8, 5);

  INSERT INTO workout_templates (id, user_id, name) VALUES (gen_random_uuid(), uid, 'LEGS — Gambe') RETURNING id INTO tpl_legs;
  INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, position) VALUES
    (tpl_legs, ex_pressa, 3, 8, 0),
    (tpl_legs, ex_leg_curl, 3, 12, 1),
    (tpl_legs, ex_rdl, 3, 12, 2),
    (tpl_legs, ex_adductor, 3, 10, 3),
    (tpl_legs, ex_polpacci, 3, 8, 4);

  -- ============================================================
  -- 4. INSERT ALL 19 SESSIONS
  -- ============================================================

  -- 01/06/26 PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-01', tpl_push) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_panca_piana, 1, 30, 7), (sess_id, ex_panca_piana, 2, 30, 7), (sess_id, ex_panca_piana, 3, 30, 5),
    (sess_id, ex_alzate_lat_manubri, 4, 10, 10), (sess_id, ex_alzate_lat_manubri, 5, 10, 10), (sess_id, ex_alzate_lat_manubri, 6, 10, 10),
    (sess_id, ex_curl_bilanciere, 7, 25, 7), (sess_id, ex_curl_bilanciere, 8, 25, 7), (sess_id, ex_curl_bilanciere, 9, 25, 6),
    (sess_id, ex_alzate_lat_cavi, 10, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 11, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 12, 3.75, 12),
    (sess_id, ex_curl_cavi, 13, 20, 12), (sess_id, ex_curl_cavi, 14, 20, 10), (sess_id, ex_curl_cavi, 15, 20, 10);

  -- 04/06/26 PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-04', tpl_pull_tri) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_lat_machine, 1, 80, 8), (sess_id, ex_lat_machine, 2, 80, 8), (sess_id, ex_lat_machine, 3, 80, 5),
    (sess_id, ex_row, 4, 80, 8), (sess_id, ex_row, 5, 80, 8), (sess_id, ex_row, 6, 80, 8),
    (sess_id, ex_french_press, 7, 25, 10), (sess_id, ex_french_press, 8, 25, 10), (sess_id, ex_french_press, 9, 25, 8),
    (sess_id, ex_row, 10, 60, 10), (sess_id, ex_row, 11, 60, 10), (sess_id, ex_row, 12, 60, 10),
    (sess_id, ex_push_down, 13, 17, 12), (sess_id, ex_push_down, 14, 17, 12), (sess_id, ex_push_down, 15, 17, 12),
    (sess_id, ex_abdominal_machine, 16, 60, 8), (sess_id, ex_abdominal_machine, 17, 60, 8), (sess_id, ex_abdominal_machine, 18, 60, 8);

  -- 05/06/26 LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-05', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_affondi_bulgari, 1, 12, 8), (sess_id, ex_affondi_bulgari, 2, 12, 8), (sess_id, ex_affondi_bulgari, 3, 12, 8),
    (sess_id, ex_leg_curl, 4, 40, 12), (sess_id, ex_leg_curl, 5, 40, 12), (sess_id, ex_leg_curl, 6, 40, 12),
    (sess_id, ex_rdl, 7, 40, 12), (sess_id, ex_rdl, 8, 40, 12), (sess_id, ex_rdl, 9, 40, 12),
    (sess_id, ex_adductor, 10, 60, 10), (sess_id, ex_adductor, 11, 60, 10), (sess_id, ex_adductor, 12, 60, 10),
    (sess_id, ex_abductor, 13, 50, 8), (sess_id, ex_abductor, 14, 50, 8),
    (sess_id, ex_polpacci, 15, 130, 8), (sess_id, ex_polpacci, 16, 130, 8), (sess_id, ex_polpacci, 17, 130, 8);

  -- 08/06/26 PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-08', tpl_push) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_panca_piana, 1, 30, 8), (sess_id, ex_panca_piana, 2, 30, 7), (sess_id, ex_panca_piana, 3, 30, 6),
    (sess_id, ex_alzate_lat_manubri, 4, 10, 10), (sess_id, ex_alzate_lat_manubri, 5, 10, 10), (sess_id, ex_alzate_lat_manubri, 6, 10, 10),
    (sess_id, ex_curl_bilanciere, 7, 25, 7), (sess_id, ex_curl_bilanciere, 8, 25, 7), (sess_id, ex_curl_bilanciere, 9, 25, 6),
    (sess_id, ex_croci, 10, 7.5, 12), (sess_id, ex_croci, 11, 7.5, 12), (sess_id, ex_croci, 12, 7.5, 12),
    (sess_id, ex_alzate_lat_cavi, 13, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 14, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 15, 3.75, 12),
    (sess_id, ex_curl_cavi, 16, 20, 12), (sess_id, ex_curl_cavi, 17, 20, 10), (sess_id, ex_curl_cavi, 18, 20, 10);

  -- 09/06/26 PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-09', tpl_pull_tri) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_row, 1, 80, 8), (sess_id, ex_row, 2, 80, 8), (sess_id, ex_row, 3, 80, 8),
    (sess_id, ex_french_press, 4, 25, 10), (sess_id, ex_french_press, 5, 25, 10), (sess_id, ex_french_press, 6, 25, 10),
    (sess_id, ex_row, 7, 60, 12), (sess_id, ex_row, 8, 60, 12), (sess_id, ex_row, 9, 60, 12),
    (sess_id, ex_push_down, 10, 17, 12), (sess_id, ex_push_down, 11, 17, 12), (sess_id, ex_push_down, 12, 17, 12),
    (sess_id, ex_abdominal_machine, 13, 60, 8), (sess_id, ex_abdominal_machine, 14, 60, 8), (sess_id, ex_abdominal_machine, 15, 60, 8);

  -- 12/06/26 LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-12', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_affondi_bulgari, 1, 14, 8), (sess_id, ex_affondi_bulgari, 2, 14, 8), (sess_id, ex_affondi_bulgari, 3, 14, 8),
    (sess_id, ex_adductor, 4, 60, 8), (sess_id, ex_adductor, 5, 60, 8), (sess_id, ex_adductor, 6, 60, 8),
    (sess_id, ex_rdl, 7, 50, 12), (sess_id, ex_rdl, 8, 50, 12), (sess_id, ex_rdl, 9, 50, 12),
    (sess_id, ex_leg_curl, 10, 30, 12), (sess_id, ex_leg_curl, 11, 30, 12), (sess_id, ex_leg_curl, 12, 30, 12),
    (sess_id, ex_polpacci, 13, 130, 8), (sess_id, ex_polpacci, 14, 130, 8), (sess_id, ex_polpacci, 15, 130, 8);

  -- 16/06/26 PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-16', tpl_push) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_panca_piana, 1, 30, 8), (sess_id, ex_panca_piana, 2, 30, 7), (sess_id, ex_panca_piana, 3, 30, 6),
    (sess_id, ex_alzate_lat_manubri, 4, 10, 10), (sess_id, ex_alzate_lat_manubri, 5, 10, 10), (sess_id, ex_alzate_lat_manubri, 6, 10, 10),
    (sess_id, ex_curl_manubri, 7, 14, 8), (sess_id, ex_curl_manubri, 8, 14, 8), (sess_id, ex_curl_manubri, 9, 14, 8),
    (sess_id, ex_croci, 10, 7.5, 12), (sess_id, ex_croci, 11, 7.5, 12), (sess_id, ex_croci, 12, 7.5, 12),
    (sess_id, ex_alzate_lat_cavi, 13, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 14, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 15, 3.75, 12),
    (sess_id, ex_curl_cavi, 16, 22, 12), (sess_id, ex_curl_cavi, 17, 22, 12), (sess_id, ex_curl_cavi, 18, 22, 12);

  -- 19/06/26 PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-19', tpl_pull_tri) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_french_press, 1, 27, 10), (sess_id, ex_french_press, 2, 27, 10), (sess_id, ex_french_press, 3, 27, 6),
    (sess_id, ex_row, 4, 80, 10), (sess_id, ex_row, 5, 80, 10), (sess_id, ex_row, 6, 80, 6),
    (sess_id, ex_push_down, 7, 22.5, 12), (sess_id, ex_push_down, 8, 22.5, 12), (sess_id, ex_push_down, 9, 22.5, 12),
    (sess_id, ex_row, 10, 60, 12), (sess_id, ex_row, 11, 60, 12), (sess_id, ex_row, 12, 60, 12),
    (sess_id, ex_abdominal_machine, 13, 60, 8), (sess_id, ex_abdominal_machine, 14, 60, 8), (sess_id, ex_abdominal_machine, 15, 60, 8);

  -- 20/06/26 LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-20', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_affondi_bulgari, 1, 14, 8), (sess_id, ex_affondi_bulgari, 2, 14, 8), (sess_id, ex_affondi_bulgari, 3, 14, 8),
    (sess_id, ex_rdl, 4, 50, 12), (sess_id, ex_rdl, 5, 50, 12), (sess_id, ex_rdl, 6, 50, 12),
    (sess_id, ex_leg_curl, 7, 30, 12), (sess_id, ex_leg_curl, 8, 30, 12), (sess_id, ex_leg_curl, 9, 30, 12),
    (sess_id, ex_adductor, 10, 60, 8), (sess_id, ex_adductor, 11, 60, 8), (sess_id, ex_adductor, 12, 60, 8),
    (sess_id, ex_polpacci, 13, 130, 8), (sess_id, ex_polpacci, 14, 130, 8), (sess_id, ex_polpacci, 15, 130, 8),
    (sess_id, ex_abdominal_machine, 16, 60, 8), (sess_id, ex_abdominal_machine, 17, 60, 8), (sess_id, ex_abdominal_machine, 18, 60, 8);

  -- 21/06/26 PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-21', tpl_push) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_panca_inclinata, 1, 26, 6), (sess_id, ex_panca_inclinata, 2, 26, 6), (sess_id, ex_panca_inclinata, 3, 26, 6),
    (sess_id, ex_curl_bilanciere, 4, 25, 8), (sess_id, ex_curl_bilanciere, 5, 25, 7), (sess_id, ex_curl_bilanciere, 6, 25, 7),
    (sess_id, ex_alzate_lat_manubri, 7, 10, 10), (sess_id, ex_alzate_lat_manubri, 8, 10, 10), (sess_id, ex_alzate_lat_manubri, 9, 10, 10),
    (sess_id, ex_croci, 10, 7.5, 12), (sess_id, ex_croci, 11, 7.5, 12), (sess_id, ex_croci, 12, 7.5, 12),
    (sess_id, ex_alzate_lat_cavi, 13, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 14, 3.75, 10), (sess_id, ex_alzate_lat_cavi, 15, 3.75, 10),
    (sess_id, ex_curl_cavi, 16, 20, 12), (sess_id, ex_curl_cavi, 17, 20, 10), (sess_id, ex_curl_cavi, 18, 20, 10);

  -- 22/06/26 PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-22', tpl_pull_tri) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_row, 1, 80, 10), (sess_id, ex_row, 2, 80, 10), (sess_id, ex_row, 3, 80, 8),
    (sess_id, ex_french_press, 4, 25, 10), (sess_id, ex_french_press, 5, 25, 10), (sess_id, ex_french_press, 6, 25, 6),
    (sess_id, ex_row, 7, 60, 12), (sess_id, ex_row, 8, 60, 12), (sess_id, ex_row, 9, 60, 12),
    (sess_id, ex_push_down, 10, 17.5, 12), (sess_id, ex_push_down, 11, 17.5, 12), (sess_id, ex_push_down, 12, 17.5, 12),
    (sess_id, ex_abdominal_machine, 13, 60, 8), (sess_id, ex_abdominal_machine, 14, 60, 8), (sess_id, ex_abdominal_machine, 15, 60, 8);

  -- 23/06/26 LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-23', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_pressa, 1, 150, 8), (sess_id, ex_pressa, 2, 150, 8), (sess_id, ex_pressa, 3, 150, 6),
    (sess_id, ex_adductor, 4, 60, 8), (sess_id, ex_adductor, 5, 60, 8), (sess_id, ex_adductor, 6, 60, 8),
    (sess_id, ex_leg_curl, 7, 0, 8), (sess_id, ex_leg_curl, 8, 0, 8), (sess_id, ex_leg_curl, 9, 0, 8),
    (sess_id, ex_rdl, 10, 50, 8), (sess_id, ex_rdl, 11, 50, 8), (sess_id, ex_rdl, 12, 50, 8),
    (sess_id, ex_polpacci, 13, 130, 8), (sess_id, ex_polpacci, 14, 130, 8), (sess_id, ex_polpacci, 15, 130, 8);

  -- 26/06/26 FREE (SPALLE)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-26', NULL) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_alzate_lat_manubri, 1, 10, 10), (sess_id, ex_alzate_lat_manubri, 2, 10, 10), (sess_id, ex_alzate_lat_manubri, 3, 10, 10),
    (sess_id, ex_lento_avanti, 4, 20, 10), (sess_id, ex_lento_avanti, 5, 20, 9), (sess_id, ex_lento_avanti, 6, 20, 8),
    (sess_id, ex_alzate_lat_cavi, 7, 3.75, 10), (sess_id, ex_alzate_lat_cavi, 8, 3.75, 10), (sess_id, ex_alzate_lat_cavi, 9, 3.75, 10),
    (sess_id, ex_row, 10, 80, 10), (sess_id, ex_row, 11, 80, 10), (sess_id, ex_row, 12, 80, 10),
    (sess_id, ex_chest_press, 13, 50, 10), (sess_id, ex_chest_press, 14, 50, 10), (sess_id, ex_chest_press, 15, 50, 10),
    (sess_id, ex_push_down, 16, 15, 10), (sess_id, ex_push_down, 17, 20, 10), (sess_id, ex_push_down, 18, 20, 10),
    (sess_id, ex_abdominal_machine, 19, 60, 8), (sess_id, ex_abdominal_machine, 20, 60, 8), (sess_id, ex_abdominal_machine, 21, 60, 8);

  -- 29/06/26 PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-29', tpl_push) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_panca_piana, 1, 30, 6), (sess_id, ex_panca_piana, 2, 30, 6), (sess_id, ex_panca_piana, 3, 30, 6),
    (sess_id, ex_croci, 4, 5, 12), (sess_id, ex_croci, 5, 5, 12), (sess_id, ex_croci, 6, 5, 12),
    (sess_id, ex_alzate_lat_manubri, 7, 10, 10), (sess_id, ex_alzate_lat_manubri, 8, 10, 10), (sess_id, ex_alzate_lat_manubri, 9, 10, 10),
    (sess_id, ex_alzate_lat_cavi, 10, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 11, 3.75, 10), (sess_id, ex_alzate_lat_cavi, 12, 3.75, 10);

  -- 30/06/26 PULL & TRI
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-30', tpl_pull_tri) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_row, 1, 80, 10), (sess_id, ex_row, 2, 80, 10), (sess_id, ex_row, 3, 80, 10),
    (sess_id, ex_french_press, 4, 27, 8), (sess_id, ex_french_press, 5, 27, 8), (sess_id, ex_french_press, 6, 27, 8),
    (sess_id, ex_row, 7, 60, 12), (sess_id, ex_row, 8, 70, 12), (sess_id, ex_row, 9, 70, 12),
    (sess_id, ex_push_down, 10, 20, 12), (sess_id, ex_push_down, 11, 20, 12), (sess_id, ex_push_down, 12, 20, 12),
    (sess_id, ex_abdominal_machine, 13, 60, 8), (sess_id, ex_abdominal_machine, 14, 60, 8), (sess_id, ex_abdominal_machine, 15, 60, 8);

  -- 01/07/26 LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-01', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_pressa, 1, 150, 8), (sess_id, ex_pressa, 2, 150, 8), (sess_id, ex_pressa, 3, 150, 6),
    (sess_id, ex_rdl, 4, 50, 10), (sess_id, ex_rdl, 5, 50, 10), (sess_id, ex_rdl, 6, 50, 10),
    (sess_id, ex_military_press, 7, 40, 8), (sess_id, ex_military_press, 8, 40, 8), (sess_id, ex_military_press, 9, 40, 8),
    (sess_id, ex_leg_curl, 10, 0, 8), (sess_id, ex_leg_curl, 11, 0, 8), (sess_id, ex_leg_curl, 12, 0, 8),
    (sess_id, ex_polpacci, 13, 130, 8), (sess_id, ex_polpacci, 14, 130, 8), (sess_id, ex_polpacci, 15, 130, 8);

  -- 04/07/26 FREE (MIXED)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-04', NULL) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_alzate_lat_manubri, 1, 10, 10), (sess_id, ex_alzate_lat_manubri, 2, 10, 10), (sess_id, ex_alzate_lat_manubri, 3, 10, 10),
    (sess_id, ex_panca_inclinata, 4, 24, 8), (sess_id, ex_panca_inclinata, 5, 24, 6), (sess_id, ex_panca_inclinata, 6, 24, 6),
    (sess_id, ex_panca_inclinata, 7, 14, 15),
    (sess_id, ex_curl_cavi, 8, 25, 8), (sess_id, ex_curl_cavi, 9, 25, 8), (sess_id, ex_curl_cavi, 10, 25, 8),
    (sess_id, ex_row, 11, 80, 8), (sess_id, ex_row, 12, 80, 8), (sess_id, ex_row, 13, 80, 8),
    (sess_id, ex_push_down, 14, 25, 10), (sess_id, ex_push_down, 15, 25, 10), (sess_id, ex_push_down, 16, 25, 10);

  -- 06/07/26 PUSH
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-06', tpl_push) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_panca_piana, 1, 30, 8), (sess_id, ex_panca_piana, 2, 30, 8), (sess_id, ex_panca_piana, 3, 30, 6),
    (sess_id, ex_curl_bilanciere, 4, 25, 8), (sess_id, ex_curl_bilanciere, 5, 25, 8), (sess_id, ex_curl_bilanciere, 6, 25, 6),
    (sess_id, ex_alzate_lat_manubri, 7, 10, 9), (sess_id, ex_alzate_lat_manubri, 8, 10, 8), (sess_id, ex_alzate_lat_manubri, 9, 10, 8),
    (sess_id, ex_curl_cavi, 10, 20, 12), (sess_id, ex_curl_cavi, 11, 20, 12), (sess_id, ex_curl_cavi, 12, 20, 12),
    (sess_id, ex_alzate_lat_cavi, 13, 3.75, 12), (sess_id, ex_alzate_lat_cavi, 14, 3.75, 10), (sess_id, ex_alzate_lat_cavi, 15, 3.75, 10);

  -- 07/07/26 LEGS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-07', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_pressa, 1, 150, 8), (sess_id, ex_pressa, 2, 150, 8), (sess_id, ex_pressa, 3, 150, 6),
    (sess_id, ex_leg_curl, 4, 45, 10), (sess_id, ex_leg_curl, 5, 45, 8), (sess_id, ex_leg_curl, 6, 45, 8),
    (sess_id, ex_adductor, 7, 60, 8), (sess_id, ex_adductor, 8, 60, 8), (sess_id, ex_adductor, 9, 60, 8),
    (sess_id, ex_abductor, 10, 70, 8), (sess_id, ex_abductor, 11, 70, 8), (sess_id, ex_abductor, 12, 70, 8),
    (sess_id, ex_leg_extension, 13, 40, 12), (sess_id, ex_leg_extension, 14, 40, 12), (sess_id, ex_leg_extension, 15, 40, 12),
    (sess_id, ex_polpacci, 16, 130, 8), (sess_id, ex_polpacci, 17, 130, 8), (sess_id, ex_polpacci, 18, 130, 8);

  RAISE NOTICE 'Complete import finished: 24 exercises + 3 templates + 19 sessions with all sets for user %', uid;

END $$;
