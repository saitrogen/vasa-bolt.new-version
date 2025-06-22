-- daily_collections example policy ,do same for other tables
CREATE POLICY "Admin can perform all actions on daily_collections"
ON public.daily_collections FOR ALL
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'::text)
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'::text);

-- need to verify this policies 
CREATE POLICY "Allow authenticated Admin users to select from appointment_services"
ON public.appointment_services
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into appointment_services"
ON public.appointment_services
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update appointment_services"
ON public.appointment_services
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from appointment_services"
ON public.appointment_services
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from barber_schedules"
ON public.barber_schedules
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into barber_schedules"
ON public.barber_schedules
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update barber_schedules"
ON public.barber_schedules
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from barber_schedules"
ON public.barber_schedules
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from barbers"
ON public.barbers
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into barbers"
ON public.barbers
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update barbers"
ON public.barbers
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from barbers"
ON public.barbers
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from clients"
ON public.clients
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from clients"
ON public.clients
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from daily_collections"
ON public.daily_collections
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into daily_collections"
ON public.daily_collections
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update daily_collections"
ON public.daily_collections
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from daily_collections"
ON public.daily_collections
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into expenses"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update expenses"
ON public.expenses
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from expenses"
ON public.expenses
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to select from services"
ON public.services
FOR SELECT
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to insert into services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to update services"
ON public.services
FOR UPDATE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow authenticated Admin users to delete from services"
ON public.services
FOR DELETE
TO authenticated
USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');