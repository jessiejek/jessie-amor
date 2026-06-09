-- MIGRATION: trip_map_itineraries (JSON blob) --> trip_map_destinations (per-row)
-- Run this in Supabase SQL Editor
-- This migrates ALL destinations from the old blob table to the new per-row table.

DELETE FROM trip_map_destinations WHERE trip_key = 'jessie-amor-malaysia-singapore';

INSERT INTO trip_map_destinations (id, trip_key, day, name, lat, lng, time, notes)
SELECT
  dest->>'id',
  t.trip_key,
  (day_data->>'day')::int,
  dest->>'name',
  (dest->>'lat')::numeric,
  (dest->>'lng')::numeric,
  COALESCE(dest->>'time', '09:00 AM'),
  COALESCE(dest->>'notes', '')
FROM trip_map_itineraries t
CROSS JOIN LATERAL jsonb_array_elements(t.data->'days') AS day_data
CROSS JOIN LATERAL jsonb_array_elements(day_data->'destinations') AS dest
WHERE t.trip_key = 'jessie-amor-malaysia-singapore';
