-- Drop the existing expenses tables to be replaced with a new structure
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.expense_categories CASCADE;

-- Create expense_categories table
CREATE TABLE public.expense_categories (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    CONSTRAINT expense_categories_pkey PRIMARY KEY (id)
);

-- Insert predefined expense categories
INSERT INTO public.expense_categories (name) VALUES
    ('car related'),
    ('maintenance'),
    ('product purchase'),
    ('visa related'),
    ('salary SBT'),
    ('water bill'),
    ('kitchen utils'),
    ('other expenses');

-- Rework the expenses table
CREATE TABLE public.expenses (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    amount numeric NOT NULL,
    notes text,
    bill_url text,
    expense_date date NOT NULL,
    category_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expenses_pkey PRIMARY KEY (id),
    CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id)
);

-- Enable RLS for the new tables
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new expenses tables

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