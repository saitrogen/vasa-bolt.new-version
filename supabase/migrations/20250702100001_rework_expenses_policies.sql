-- RLS Policies for reworked expenses tables

-- Allow admin users to manage categories
CREATE POLICY "Allow admin to manage expense categories" ON public.expense_categories
    FOR ALL
    USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
    WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Allow admin users to manage expenses
CREATE POLICY "Allow admin to manage expenses" ON public.expenses
    FOR ALL
    USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
    WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)); 