-- Run AFTER schema.sql — maps exercises to muscle groups
-- Get exercise IDs first, then map them

do $$
declare
  e_panca_piana uuid;
  e_panca_inclinata uuid;
  e_panca_declinata uuid;
  e_croci uuid;
  e_pushup uuid;
  e_squat uuid;
  e_legpress uuid;
  e_affondi uuid;
  e_legext uuid;
  e_legcurl uuid;
  e_stacco uuid;
  e_rdl uuid;
  e_hipthrust uuid;
  e_trazioni uuid;
  e_latmachine uuid;
  e_rematore_bil uuid;
  e_rematore_man uuid;
  e_military uuid;
  e_lento_avanti uuid;
  e_alzate_lat uuid;
  e_curl_bil uuid;
  e_curl_man uuid;
  e_hammer uuid;
  e_tricavi uuid;
  e_french uuid;
  e_dip uuid;
  e_plank uuid;
  e_crunch uuid;
  e_calf uuid;
  mg_petto uuid; mg_dorso uuid; mg_spalle uuid; mg_bicipiti uuid; mg_tricipiti uuid;
  mg_quad uuid; mg_femorali uuid; mg_glutei uuid; mg_core uuid; mg_polpacci uuid; mg_avambracci uuid;
begin
  select id into mg_petto from muscle_groups where name = 'Petto';
  select id into mg_dorso from muscle_groups where name = 'Dorso';
  select id into mg_spalle from muscle_groups where name = 'Spalle';
  select id into mg_bicipiti from muscle_groups where name = 'Bicipiti';
  select id into mg_tricipiti from muscle_groups where name = 'Tricipiti';
  select id into mg_quad from muscle_groups where name = 'Quadricipiti';
  select id into mg_femorali from muscle_groups where name = 'Femorali';
  select id into mg_glutei from muscle_groups where name = 'Glutei';
  select id into mg_core from muscle_groups where name = 'Core';
  select id into mg_polpacci from muscle_groups where name = 'Polpacci';
  select id into mg_avambracci from muscle_groups where name = 'Avambracci';

  select id into e_panca_piana from exercises where name = 'Panca Piana' and user_id is null;
  select id into e_panca_inclinata from exercises where name = 'Panca Inclinata' and user_id is null;
  select id into e_panca_declinata from exercises where name = 'Panca Declinata' and user_id is null;
  select id into e_croci from exercises where name = 'Croci Piana' and user_id is null;
  select id into e_pushup from exercises where name = 'Push-up' and user_id is null;
  select id into e_squat from exercises where name = 'Squat' and user_id is null;
  select id into e_legpress from exercises where name = 'Leg Press' and user_id is null;
  select id into e_affondi from exercises where name = 'Affondi' and user_id is null;
  select id into e_legext from exercises where name = 'Leg Extension' and user_id is null;
  select id into e_legcurl from exercises where name = 'Leg Curl' and user_id is null;
  select id into e_stacco from exercises where name = 'Stacco da Terra' and user_id is null;
  select id into e_rdl from exercises where name = 'Romanian Deadlift' and user_id is null;
  select id into e_hipthrust from exercises where name = 'Hip Thrust' and user_id is null;
  select id into e_trazioni from exercises where name = 'Trazioni' and user_id is null;
  select id into e_latmachine from exercises where name = 'Lat Machine' and user_id is null;
  select id into e_rematore_bil from exercises where name = 'Rematore con Bilanciere' and user_id is null;
  select id into e_rematore_man from exercises where name = 'Rematore con Manubrio' and user_id is null;
  select id into e_military from exercises where name = 'Military Press' and user_id is null;
  select id into e_lento_avanti from exercises where name = 'Lento Avanti con Manubri' and user_id is null;
  select id into e_alzate_lat from exercises where name = 'Alzate Laterali' and user_id is null;
  select id into e_curl_bil from exercises where name = 'Curl con Bilanciere' and user_id is null;
  select id into e_curl_man from exercises where name = 'Curl con Manubri' and user_id is null;
  select id into e_hammer from exercises where name = 'Hammer Curl' and user_id is null;
  select id into e_tricavi from exercises where name = 'Tricipiti ai Cavi' and user_id is null;
  select id into e_french from exercises where name = 'French Press' and user_id is null;
  select id into e_dip from exercises where name = 'Dip alle Parallele' and user_id is null;
  select id into e_plank from exercises where name = 'Plank' and user_id is null;
  select id into e_crunch from exercises where name = 'Crunch' and user_id is null;
  select id into e_calf from exercises where name = 'Calf Raise' and user_id is null;

  insert into exercise_muscles values
    (e_panca_piana, mg_petto, 'primary'), (e_panca_piana, mg_tricipiti, 'secondary'), (e_panca_piana, mg_spalle, 'secondary'),
    (e_panca_inclinata, mg_petto, 'primary'), (e_panca_inclinata, mg_spalle, 'secondary'), (e_panca_inclinata, mg_tricipiti, 'secondary'),
    (e_panca_declinata, mg_petto, 'primary'), (e_panca_declinata, mg_tricipiti, 'secondary'),
    (e_croci, mg_petto, 'primary'), (e_croci, mg_spalle, 'secondary'),
    (e_pushup, mg_petto, 'primary'), (e_pushup, mg_tricipiti, 'secondary'), (e_pushup, mg_core, 'secondary'),
    (e_squat, mg_quad, 'primary'), (e_squat, mg_glutei, 'secondary'), (e_squat, mg_femorali, 'secondary'), (e_squat, mg_core, 'secondary'),
    (e_legpress, mg_quad, 'primary'), (e_legpress, mg_glutei, 'secondary'),
    (e_affondi, mg_quad, 'primary'), (e_affondi, mg_glutei, 'secondary'),
    (e_legext, mg_quad, 'primary'),
    (e_legcurl, mg_femorali, 'primary'),
    (e_stacco, mg_dorso, 'primary'), (e_stacco, mg_glutei, 'secondary'), (e_stacco, mg_femorali, 'secondary'), (e_stacco, mg_core, 'secondary'),
    (e_rdl, mg_femorali, 'primary'), (e_rdl, mg_glutei, 'secondary'), (e_rdl, mg_dorso, 'secondary'),
    (e_hipthrust, mg_glutei, 'primary'), (e_hipthrust, mg_femorali, 'secondary'),
    (e_trazioni, mg_dorso, 'primary'), (e_trazioni, mg_bicipiti, 'secondary'),
    (e_latmachine, mg_dorso, 'primary'), (e_latmachine, mg_bicipiti, 'secondary'),
    (e_rematore_bil, mg_dorso, 'primary'), (e_rematore_bil, mg_bicipiti, 'secondary'),
    (e_rematore_man, mg_dorso, 'primary'), (e_rematore_man, mg_bicipiti, 'secondary'),
    (e_military, mg_spalle, 'primary'), (e_military, mg_tricipiti, 'secondary'),
    (e_lento_avanti, mg_spalle, 'primary'), (e_lento_avanti, mg_tricipiti, 'secondary'),
    (e_alzate_lat, mg_spalle, 'primary'),
    (e_curl_bil, mg_bicipiti, 'primary'), (e_curl_bil, mg_avambracci, 'secondary'),
    (e_curl_man, mg_bicipiti, 'primary'), (e_curl_man, mg_avambracci, 'secondary'),
    (e_hammer, mg_bicipiti, 'primary'), (e_hammer, mg_avambracci, 'secondary'),
    (e_tricavi, mg_tricipiti, 'primary'),
    (e_french, mg_tricipiti, 'primary'),
    (e_dip, mg_tricipiti, 'primary'), (e_dip, mg_petto, 'secondary'), (e_dip, mg_spalle, 'secondary'),
    (e_plank, mg_core, 'primary'),
    (e_crunch, mg_core, 'primary'),
    (e_calf, mg_polpacci, 'primary')
  on conflict do nothing;
end $$;
