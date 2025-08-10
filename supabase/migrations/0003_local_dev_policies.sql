-- Temporary policies for local development
-- These allow unauthenticated access for easier local testing

-- Allow anonymous users to insert/update their own profile
DROP POLICY IF EXISTS "users insert own profile" ON public.users;
CREATE POLICY "users insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (true); -- Allow any insert for local dev

DROP POLICY IF EXISTS "users update own profile" ON public.users;
CREATE POLICY "users update own profile" 
ON public.users FOR UPDATE 
USING (true) -- Allow any update for local dev
WITH CHECK (true);

-- Allow anonymous users to insert orders (for local dev)
DROP POLICY IF EXISTS "orders insert own" ON public.orders;
CREATE POLICY "orders insert own" 
ON public.orders FOR INSERT 
WITH CHECK (true); -- Allow any insert for local dev

-- Allow reading orders for local dev
DROP POLICY IF EXISTS "orders select own" ON public.orders;
CREATE POLICY "orders select own" 
ON public.orders FOR SELECT 
USING (true); -- Allow reading any order for local dev