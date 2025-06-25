-- Create clients table
CREATE TABLE public.clients (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    phone_number text,
    email text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT clients_pkey PRIMARY KEY (id)
);

-- Create services table
CREATE TABLE public.services (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    price numeric NOT NULL,
    duration_minutes integer NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- Create barbers table
CREATE TABLE public.barbers (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id text,
    name text NOT NULL,
    phone_number_work text,
    phone_number_home text,
    email text,
    home_address text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    visa_number text,
    visa_expiry_date date,
    passport_number text,
    passport_expiry_date date,
    CONSTRAINT barbers_pkey PRIMARY KEY (id)
);

-- Create barber_schedules table
CREATE TABLE public.barber_schedules (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    barber_id bigint NOT NULL,
    day_of_week integer,
    start_time text,
    end_time text,
    specific_date_override text,
    override_start_time text,
    override_end_time text,
    is_day_off boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT barber_schedules_pkey PRIMARY KEY (id)
);

-- Create daily_collections table
CREATE TABLE public.daily_collections (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    barber_id bigint NOT NULL,
    collection_date date NOT NULL,
    total_amount_manually_entered numeric NOT NULL,
    number_of_appointments integer,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_collections_pkey PRIMARY KEY (id)
);

-- Create appointments table
CREATE TABLE public.appointments (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    client_id bigint NOT NULL,
    barber_id bigint NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text NOT NULL,
    total_amount numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rating real,
    CONSTRAINT appointments_pkey PRIMARY KEY (id)
);

-- Create appointment_services table
CREATE TABLE public.appointment_services (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    appointment_id bigint NOT NULL,
    service_id bigint NOT NULL,
    price_at_booking numeric NOT NULL,
    duration_at_booking integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT appointment_services_pkey PRIMARY KEY (id)
);


-- Add foreign keys
ALTER TABLE public.barber_schedules ADD CONSTRAINT barber_schedules_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id);
ALTER TABLE public.daily_collections ADD CONSTRAINT daily_collections_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY; 