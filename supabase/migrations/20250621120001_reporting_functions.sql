-- Daily Summary Report
CREATE OR REPLACE FUNCTION public.get_daily_summary(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  "date" date,
  total_appointments bigint,
  total_revenue numeric,
  total_duration_minutes numeric
)
LANGUAGE sql
AS $$
SELECT
    a.start_time::date as "date",
    count(DISTINCT a.id) as total_appointments,
    sum(aps.price_at_booking * aps.quantity) as total_revenue,
    sum(aps.duration_at_booking * aps.quantity) as total_duration_minutes
FROM
    appointments a
JOIN
    appointment_services aps ON a.id = aps.appointment_id
WHERE
    (start_date IS NULL OR a.start_time::date >= start_date) AND
    (end_date IS NULL OR a.start_time::date <= end_date)
GROUP BY
    a.start_time::date
ORDER BY
    a.start_time::date;
$$;

-- Monthly Summary Report
CREATE OR REPLACE FUNCTION public.get_monthly_summary(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  month text,
  total_appointments bigint,
  total_revenue numeric,
  total_duration_minutes numeric
)
LANGUAGE sql
AS $$
SELECT
    TO_CHAR(a.start_time::date, 'YYYY-MM') as month,
    count(DISTINCT a.id) as total_appointments,
    sum(aps.price_at_booking * aps.quantity) as total_revenue,
    sum(aps.duration_at_booking * aps.quantity) as total_duration_minutes
FROM
    appointments a
JOIN
    appointment_services aps ON a.id = aps.appointment_id
WHERE
    (start_date IS NULL OR a.start_time::date >= start_date) AND
    (end_date IS NULL OR a.start_time::date <= end_date)
GROUP BY
    TO_CHAR(a.start_time::date, 'YYYY-MM')
ORDER BY
    TO_CHAR(a.start_time::date, 'YYYY-MM');
$$;

-- Barber Performance Report
CREATE OR REPLACE FUNCTION public.get_barber_performance(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  barber_id_param bigint DEFAULT NULL
)
RETURNS TABLE (
  barber_name text,
  total_appointments bigint,
  total_revenue numeric,
  average_rating numeric
)
LANGUAGE sql
AS $$
SELECT
    b.name as barber_name,
    count(DISTINCT a.id) as total_appointments,
    sum(aps.price_at_booking * aps.quantity) as total_revenue,
    avg(a.rating) as average_rating
FROM
    appointments a
JOIN
    appointment_services aps ON a.id = aps.appointment_id
JOIN
    barbers b ON a.barber_id = b.id
WHERE
    (start_date IS NULL OR a.start_time::date >= start_date) AND
    (end_date IS NULL OR a.start_time::date <= end_date) AND
    (barber_id_param IS NULL OR a.barber_id = barber_id_param)
GROUP BY
    b.name
ORDER BY
    total_revenue DESC;
$$; 