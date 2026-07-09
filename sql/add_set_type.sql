-- Add set_type column to session_sets
-- Run this on Supabase SQL editor

alter table session_sets add column set_type text check (set_type in ('topset', 'backoff') or set_type is null);
