-- Drop the existing expenses table to be replaced with a new structure
DROP TABLE IF EXISTS public.expenses CASCADE;

-- Create expense_categories table to store dynamic form configurations
CREATE TABLE public.expense_categories (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL UNIQUE,
    config jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    CONSTRAINT expense_categories_pkey PRIMARY KEY (id)
);

-- Rework the expenses table to support dynamic data
CREATE TABLE public.expenses (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    expense_date date NOT NULL,
    category_id bigint NOT NULL,
    amount numeric NOT NULL,
    details jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expenses_pkey PRIMARY KEY (id),
    CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id)
);

-- Enable RLS for the new tables
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY; 