-- Approximate muscle activation mappings for exercises present in the current
-- exercise export but missing from exercise_muscles.
-- Percentages are heuristic indicators, not EMG measurements.
INSERT INTO public.exercise_muscles
  (exercise_id, muscle_group_id, activation_percentage)
VALUES
  -- Shoulder press (machine)
  ('01c59fcd-5c59-4def-9b77-b80353807457', '13b8f372-6501-4539-951b-284fef927bc1', 80.00), -- Spalle
  ('01c59fcd-5c59-4def-9b77-b80353807457', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', 35.00), -- Tricipiti
  ('01c59fcd-5c59-4def-9b77-b80353807457', '6451139b-1a47-4650-8ea3-927d5a06628c', 15.00), -- Core

  -- French press (dumbbells)
  ('076f7f9f-a691-4c40-99d7-7a96242cdabf', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', 90.00), -- Tricipiti
  ('076f7f9f-a691-4c40-99d7-7a96242cdabf', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Arm curl (machine)
  ('113c877a-8f30-4709-bff8-92798a599a3a', '89a58787-8d20-4398-a57e-a219ef1c470f', 95.00), -- Bicipiti
  ('113c877a-8f30-4709-bff8-92798a599a3a', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Lateral raise (cable)
  ('3b000aa9-4424-42ff-8310-e7fac3e38fd2', '13b8f372-6501-4539-951b-284fef927bc1', 88.00), -- Spalle
  ('3b000aa9-4424-42ff-8310-e7fac3e38fd2', '6451139b-1a47-4650-8ea3-927d5a06628c', 10.00), -- Core

  -- Military press (dumbbells)
  ('589a55e5-7a75-4fd3-a8db-8f04df753c5a', '13b8f372-6501-4539-951b-284fef927bc1', 80.00), -- Spalle
  ('589a55e5-7a75-4fd3-a8db-8f04df753c5a', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', 35.00), -- Tricipiti
  ('589a55e5-7a75-4fd3-a8db-8f04df753c5a', '6451139b-1a47-4650-8ea3-927d5a06628c', 20.00), -- Core

  -- Low row 2 (machine)
  ('69e5b0d0-a7fd-437a-9cbc-e64fef04b785', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 85.00), -- Dorso
  ('69e5b0d0-a7fd-437a-9cbc-e64fef04b785', '89a58787-8d20-4398-a57e-a219ef1c470f', 35.00), -- Bicipiti
  ('69e5b0d0-a7fd-437a-9cbc-e64fef04b785', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Shrugs (stored as "Scrollate"); Trapezi is not available in muscle_groups.
  ('6cd94100-b863-4cc4-8bcd-b1de722dade5', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 80.00), -- Dorso (proxy for trapezi)
  ('6cd94100-b863-4cc4-8bcd-b1de722dade5', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Front raise (cable)
  ('7c0a098d-487f-4f6d-ac11-8d1c5f152e54', '13b8f372-6501-4539-951b-284fef927bc1', 85.00), -- Spalle
  ('7c0a098d-487f-4f6d-ac11-8d1c5f152e54', '6451139b-1a47-4650-8ea3-927d5a06628c', 10.00), -- Core

  -- Hack squat (machine)
  ('af707685-d0b4-447c-8033-57b465112194', '67f07249-c145-43a7-a1be-d2a6227b283c', 85.00), -- Quadricipiti
  ('af707685-d0b4-447c-8033-57b465112194', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', 55.00), -- Glutei
  ('af707685-d0b4-447c-8033-57b465112194', '963fba48-53da-4240-99aa-51aec8d6bed9', 20.00), -- Femorali

  -- Pull down (machine)
  ('af87044c-01c3-45e7-a3f5-1b4271069e8d', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 75.00), -- Dorso
  ('af87044c-01c3-45e7-a3f5-1b4271069e8d', '89a58787-8d20-4398-a57e-a219ef1c470f', 35.00), -- Bicipiti
  ('af87044c-01c3-45e7-a3f5-1b4271069e8d', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Chest fly (machine)
  ('b409e5fb-c41f-4b7c-b6cd-0253d4523f9f', '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a', 95.00), -- Petto
  ('b409e5fb-c41f-4b7c-b6cd-0253d4523f9f', '13b8f372-6501-4539-951b-284fef927bc1', 25.00), -- Spalle
  ('b409e5fb-c41f-4b7c-b6cd-0253d4523f9f', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', 10.00), -- Tricipiti

  -- Pulley (generic seated cable row)
  ('c6a5bdc8-ad7d-4895-b486-6ad7cc7c3537', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 80.00), -- Dorso
  ('c6a5bdc8-ad7d-4895-b486-6ad7cc7c3537', '89a58787-8d20-4398-a57e-a219ef1c470f', 40.00), -- Bicipiti
  ('c6a5bdc8-ad7d-4895-b486-6ad7cc7c3537', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Reverse fly (machine)
  ('c6bb11b7-0d5d-4c7a-b9d0-6754cc0646a2', '13b8f372-6501-4539-951b-284fef927bc1', 75.00), -- Spalle
  ('c6bb11b7-0d5d-4c7a-b9d0-6754cc0646a2', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 55.00), -- Dorso
  ('c6bb11b7-0d5d-4c7a-b9d0-6754cc0646a2', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 10.00), -- Avambracci

  -- Prone leg curl (machine)
  ('cc563da5-4230-480a-a00e-12d35fe17331', '963fba48-53da-4240-99aa-51aec8d6bed9', 92.00), -- Femorali
  ('cc563da5-4230-480a-a00e-12d35fe17331', 'f2102e8c-d015-437e-82f5-98047d9eaf1a', 15.00), -- Glutei
  ('cc563da5-4230-480a-a00e-12d35fe17331', '29d8f01c-3ab0-4d96-8001-95b308955a64', 10.00), -- Polpacci

  -- Incline chest press (machine)
  ('cedda51a-0c8a-455f-bb1b-4bfb218deadd', '7001d01a-10f4-4cfc-aacb-a35d99bbaa0a', 85.00), -- Petto
  ('cedda51a-0c8a-455f-bb1b-4bfb218deadd', '13b8f372-6501-4539-951b-284fef927bc1', 55.00), -- Spalle
  ('cedda51a-0c8a-455f-bb1b-4bfb218deadd', '80fdafca-2fd6-4485-a63a-a99bb3ca73de', 35.00), -- Tricipiti

  -- Lat Pulldown (single)
  ('62dc7192-c309-46ff-b6a9-1a2837b91a81', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 78.00), -- Dorso
  ('62dc7192-c309-46ff-b6a9-1a2837b91a81', '89a58787-8d20-4398-a57e-a219ef1c470f', 35.00), -- Bicipiti
  ('62dc7192-c309-46ff-b6a9-1a2837b91a81', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00), -- Avambracci

  -- Row (deltoide posteriore)
  ('dcaf26a0-6bb8-4ab3-87eb-90f46068c8f1', '13b8f372-6501-4539-951b-284fef927bc1', 75.00), -- Spalle
  ('dcaf26a0-6bb8-4ab3-87eb-90f46068c8f1', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 60.00), -- Dorso
  ('dcaf26a0-6bb8-4ab3-87eb-90f46068c8f1', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 10.00), -- Avambracci

  -- Row (dorso)
  ('a13551e0-ef39-42c9-ae3e-03303b0de99f', '86e49537-548a-4c0c-bc7c-69dd28e72b41', 85.00), -- Dorso
  ('a13551e0-ef39-42c9-ae3e-03303b0de99f', '89a58787-8d20-4398-a57e-a219ef1c470f', 35.00), -- Bicipiti
  ('a13551e0-ef39-42c9-ae3e-03303b0de99f', 'c02ce640-3a3b-4e5a-9b5c-e6b228885d80', 15.00); -- Avambracci
