-- ============================================================
-- IMPORT SESSIONS — user 36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4
-- 19 sessions with all sets (June-July 2026)
-- Run AFTER import_user_36a75070.sql
-- ============================================================

DO $$
DECLARE
  uid uuid := '36a75070-c4a1-4c8c-b5e9-85ad08e6d9a4';
  tpl_push uuid;
  tpl_pull_tri uuid;
  tpl_legs uuid;

  -- Exercise IDs (from previous import)
  ex_panca_piana uuid;
  ex_panca_inclinata uuid;
  ex_alzate_lat_manubri uuid;
  ex_alzate_lat_cavi uuid;
  ex_curl_bilanciere uuid;
  ex_curl_cavi uuid;
  ex_curl_manubri uuid;
  ex_croci uuid;
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
  ex_lento_avanti uuid;
  ex_military_press uuid;
  ex_chest_press uuid;

  sess_id uuid;

BEGIN

  -- Get template IDs
  SELECT id INTO tpl_push FROM workout_templates WHERE user_id = uid AND name LIKE 'PUSH%' LIMIT 1;
  SELECT id INTO tpl_pull_tri FROM workout_templates WHERE user_id = uid AND name LIKE 'PULL%' LIMIT 1;
  SELECT id INTO tpl_legs FROM workout_templates WHERE user_id = uid AND name LIKE 'LEGS%' LIMIT 1;

  -- Get exercise IDs
  SELECT id INTO ex_panca_piana FROM exercises WHERE name = 'Panca piana' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Manubri') LIMIT 1;
  SELECT id INTO ex_panca_inclinata FROM exercises WHERE name = 'Panca inclinata' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Manubri') LIMIT 1;
  SELECT id INTO ex_alzate_lat_manubri FROM exercises WHERE name = 'Alzate laterali' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Manubri') LIMIT 1;
  SELECT id INTO ex_alzate_lat_cavi FROM exercises WHERE name = 'Alzate laterali' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Cavi') LIMIT 1;
  SELECT id INTO ex_curl_bilanciere FROM exercises WHERE name = 'Curl' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Bilanciere Z') LIMIT 1;
  SELECT id INTO ex_curl_cavi FROM exercises WHERE name = 'Curl' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Cavi') LIMIT 1;
  SELECT id INTO ex_curl_manubri FROM exercises WHERE name = 'Curl' AND equipment_id = (SELECT id FROM equipment_types WHERE name = 'Manubri') LIMIT 1;
  SELECT id INTO ex_croci FROM exercises WHERE name = 'Croci' LIMIT 1;
  SELECT id INTO ex_lat_machine FROM exercises WHERE name = 'Lat machine' LIMIT 1;
  SELECT id INTO ex_row FROM exercises WHERE name = 'Row' LIMIT 1;
  SELECT id INTO ex_french_press FROM exercises WHERE name = 'French press' LIMIT 1;
  SELECT id INTO ex_push_down FROM exercises WHERE name = 'Push down' LIMIT 1;
  SELECT id INTO ex_abdominal_machine FROM exercises WHERE name = 'Abdominal machine' LIMIT 1;
  SELECT id INTO ex_affondi_bulgari FROM exercises WHERE name = 'Affondi bulgari' LIMIT 1;
  SELECT id INTO ex_pressa FROM exercises WHERE name = 'Pressa' LIMIT 1;
  SELECT id INTO ex_rdl FROM exercises WHERE name = 'RDL' LIMIT 1;
  SELECT id INTO ex_leg_curl FROM exercises WHERE name = 'Leg curl' LIMIT 1;
  SELECT id INTO ex_leg_extension FROM exercises WHERE name = 'Leg extension' LIMIT 1;
  SELECT id INTO ex_adductor FROM exercises WHERE name = 'Adductor' LIMIT 1;
  SELECT id INTO ex_abductor FROM exercises WHERE name = 'Abductor' LIMIT 1;
  SELECT id INTO ex_polpacci FROM exercises WHERE name = 'Polpacci' LIMIT 1;
  SELECT id INTO ex_lento_avanti FROM exercises WHERE name = 'Lento avanti' LIMIT 1;
  SELECT id INTO ex_military_press FROM exercises WHERE name = 'Military press' LIMIT 1;
  SELECT id INTO ex_chest_press FROM exercises WHERE name = 'Chest press' LIMIT 1;

  -- ============================================================
  -- INSERT SESSIONS (01/06 - 07/07)
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

  -- 09/06/26 PULL & TRI (short)
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

  -- 16/06/26 PUSH (inclinata)
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

  -- 20/06/26 LEGS + ABS
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-06-20', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_affondi_bulgari, 1, 14, 8), (sess_id, ex_affondi_bulgari, 2, 14, 8), (sess_id, ex_affondi_bulgari, 3, 14, 8),
    (sess_id, ex_rdl, 4, 50, 12), (sess_id, ex_rdl, 5, 50, 12), (sess_id, ex_rdl, 6, 50, 12),
    (sess_id, ex_leg_curl, 7, 30, 12), (sess_id, ex_leg_curl, 8, 30, 12), (sess_id, ex_leg_curl, 9, 30, 12),
    (sess_id, ex_adductor, 10, 60, 8), (sess_id, ex_adductor, 11, 60, 8), (sess_id, ex_adductor, 12, 60, 8),
    (sess_id, ex_polpacci, 13, 130, 8), (sess_id, ex_polpacci, 14, 130, 8), (sess_id, ex_polpacci, 15, 130, 8),
    (sess_id, ex_abdominal_machine, 16, 60, 8), (sess_id, ex_abdominal_machine, 17, 60, 8), (sess_id, ex_abdominal_machine, 18, 60, 8);

  -- 21/06/26 PUSH (30° inclinata)
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

  -- 23/06/26 LEGS (pressa, leg curl no weight)
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

  -- 29/06/26 PUSH (short)
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

  -- 01/07/26 LEGS + MILITARY
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

  -- 07/07/26 LEGS (complete)
  INSERT INTO sessions (id, user_id, date, template_id) VALUES (gen_random_uuid(), uid, '2026-07-07', tpl_legs) RETURNING id INTO sess_id;
  INSERT INTO session_sets (session_id, exercise_id, set_number, weight, reps) VALUES
    (sess_id, ex_pressa, 1, 150, 8), (sess_id, ex_pressa, 2, 150, 8), (sess_id, ex_pressa, 3, 150, 6),
    (sess_id, ex_leg_curl, 4, 45, 10), (sess_id, ex_leg_curl, 5, 45, 8), (sess_id, ex_leg_curl, 6, 45, 8),
    (sess_id, ex_adductor, 7, 60, 8), (sess_id, ex_adductor, 8, 60, 8), (sess_id, ex_adductor, 9, 60, 8),
    (sess_id, ex_abductor, 10, 70, 8), (sess_id, ex_abductor, 11, 70, 8), (sess_id, ex_abductor, 12, 70, 8),
    (sess_id, ex_leg_extension, 13, 40, 12), (sess_id, ex_leg_extension, 14, 40, 12), (sess_id, ex_leg_extension, 15, 40, 12),
    (sess_id, ex_polpacci, 16, 130, 8), (sess_id, ex_polpacci, 17, 130, 8), (sess_id, ex_polpacci, 18, 130, 8);

  RAISE NOTICE 'Imported 19 complete sessions with all sets for user %', uid;

END $$;
