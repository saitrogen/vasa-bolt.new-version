-- Add indexes to frequently queried columns to improve performance

CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id); 