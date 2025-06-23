-- Appointments
CREATE POLICY "Allow authenticated Admin users to perform all actions on appoi" ON public.appointments
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Barbers
CREATE POLICY "Allow authenticated Admin users to perform all actions" ON public.barbers
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Clients
CREATE POLICY "Allow authenticated Admin users to perform all actions" ON public.clients
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Barber Schedules
CREATE POLICY "Allow authenticated Admin users to perform all actions" ON public.barber_schedules
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Services
CREATE POLICY "Allow authenticated Admin users to perform all actions" ON public.services
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Expenses
CREATE POLICY "Allow authenticated Admin users to perform all actions" ON public.expenses
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- Appointment Services
CREATE POLICY "Allow authenticated Admin users to perform all actions on appoi" ON public.appointment_services
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));


-- Daily Collections
CREATE POLICY "Allow authenticated Admin users to perform all actions" ON public.daily_collections
FOR ALL
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)); 