-- First, ensure RLS is enabled on all relevant tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop all old policies from the previous migration
-- We are dropping them because they were not granular enough
-- A simple loop in a psql script could do this, but for a migration file, it's better to be explicit.
-- The names are taken from the 'polices-admin.sql' file.
DROP POLICY IF EXISTS "Admin can perform all actions on daily_collections" ON public.daily_collections;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from appointment_services" ON public.appointment_services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into appointment_services" ON public.appointment_services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update appointment_services" ON public.appointment_services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from appointment_services" ON public.appointment_services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from barber_schedules" ON public.barber_schedules;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into barber_schedules" ON public.barber_schedules;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update barber_schedules" ON public.barber_schedules;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from barber_schedules" ON public.barber_schedules;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from barbers" ON public.barbers;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into barbers" ON public.barbers;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update barbers" ON public.barbers;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from barbers" ON public.barbers;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from daily_collections" ON public.daily_collections;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into daily_collections" ON public.daily_collections;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update daily_collections" ON public.daily_collections;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from daily_collections" ON public.daily_collections;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated Admin users to select from services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to insert into services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to update services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated Admin users to delete from services" ON public.services;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt()->'app_metadata'->>'role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get barber_id from user_id
CREATE OR REPLACE FUNCTION get_my_barber_id()
RETURNS UUID AS $$
DECLARE
  barber_id_val UUID;
BEGIN
  SELECT id INTO barber_id_val FROM public.barbers WHERE user_id = auth.uid() LIMIT 1;
  RETURN barber_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- Policies for 'admin' role (full access to everything)
-- =================================================================
CREATE POLICY "Admins have full access to clients" ON public.clients FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to services" ON public.services FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to barbers" ON public.barbers FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to appointments" ON public.appointments FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to appointment_services" ON public.appointment_services FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to barber_schedules" ON public.barber_schedules FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to daily_collections" ON public.daily_collections FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Admins have full access to expenses" ON public.expenses FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');


-- =================================================================
-- Policies for 'barber' role
-- =================================================================

-- Allow barbers to create new clients
CREATE POLICY "Barbers can create clients" ON public.clients FOR INSERT WITH CHECK (get_my_role() = 'barber');

-- Barbers can see their own record and update it
CREATE POLICY "Barbers can view their own record" ON public.barbers FOR SELECT USING (id = get_my_barber_id() AND get_my_role() = 'barber');
CREATE POLICY "Barbers can update their own record" ON public.barbers FOR UPDATE USING (id = get_my_barber_id() AND get_my_role() = 'barber');


-- Barbers can manage their own appointments
CREATE POLICY "Barbers can view their own appointments" ON public.appointments FOR SELECT USING (barber_id = get_my_barber_id() AND get_my_role() = 'barber');
CREATE POLICY "Barbers can create their own appointments" ON public.appointments FOR INSERT WITH CHECK (barber_id = get_my_barber_id() AND get_my_role() = 'barber');
CREATE POLICY "Barbers can update their own appointments" ON public.appointments FOR UPDATE USING (barber_id = get_my_barber_id() AND get_my_role() = 'barber');


-- Barbers can manage services for their own appointments
CREATE POLICY "Barbers can manage services for their appointments" ON public.appointment_services
  FOR ALL
  USING (
    get_my_role() = 'barber' AND
    appointment_id IN (SELECT id FROM public.appointments WHERE barber_id = get_my_barber_id())
  )
  WITH CHECK (
    get_my_role() = 'barber' AND
    appointment_id IN (SELECT id FROM public.appointments WHERE barber_id = get_my_barber_id())
  );


-- Barbers can manage their own schedules
CREATE POLICY "Barbers can manage their own schedule" ON public.barber_schedules FOR ALL
  USING (barber_id = get_my_barber_id() AND get_my_role() = 'barber')
  WITH CHECK (barber_id = get_my_barber_id() AND get_my_role() = 'barber');

-- =================================================================
-- Policies for any authenticated user
-- =================================================================

-- Any authenticated user should be able to see the list of services and barbers.
CREATE POLICY "Authenticated users can view services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view barbers" ON public.barbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true); 