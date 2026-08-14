DROP POLICY IF EXISTS "Allow listening for broadcasts for authenticated users only" ON realtime.messages;
DROP POLICY IF EXISTS "Allow pushing broadcasts for authenticated users only" ON realtime.messages;
DROP POLICY IF EXISTS "Allow broadcasting presences on all channels for authenticated" ON realtime.messages;
DROP POLICY IF EXISTS "Allow listening for presences on all channels for authenticated" ON realtime.messages;