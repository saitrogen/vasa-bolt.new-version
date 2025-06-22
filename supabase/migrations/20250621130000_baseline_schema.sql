-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    phone_number text,
    email text,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    duration_minutes integer NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create barbers table
CREATE TABLE IF NOT EXISTS public.barbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    phone_number_work text,
    phone_number_home text,
    email text,
    home_address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id),
    barber_id uuid NOT NULL REFERENCES public.barbers(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    total_amount numeric,
    notes text,
    rating integer,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create appointment_services table
CREATE TABLE IF NOT EXISTS public.appointment_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES public.services(id),
    price_at_booking numeric NOT NULL,
    duration_at_booking integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create barber_schedules table
CREATE TABLE IF NOT EXISTS public.barber_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    day_of_week integer,
    start_time time,
    end_time time,
    specific_date_override date,
    override_start_time time,
    override_end_time time,
    is_day_off boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create daily_collections table
CREATE TABLE IF NOT EXISTS public.daily_collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    barber_id uuid NOT NULL REFERENCES public.barbers(id),
    collection_date date NOT NULL,
    total_amount_manually_entered numeric NOT NULL,
    number_of_appointments integer,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    expense_date date NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    bill_image_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
); 