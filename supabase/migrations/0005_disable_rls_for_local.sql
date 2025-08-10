-- Temporarily disable RLS for local development
-- This makes local development much easier without complex auth setup

-- Disable RLS on users and orders tables for local dev
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on menu_items since it's public read anyway
-- ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY; (already enabled)

-- Note: In production, you would re-enable RLS and use proper Clerk JWT policies