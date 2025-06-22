export interface Client {
  id: string
  name: string
  phone_number: string | null
  email: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Barber {
  id: string
  user_id: string | null
  name: string
  phone_number_work: string | null
  phone_number_home: string | null
  email: string | null
  home_address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  visa_number: string | null
  visa_expiry_date: string | null
  passport_number: string | null
  passport_expiry_date: string | null
}

export interface BarberSchedule {
  id: string
  barber_id: string
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
  specific_date_override: string | null
  override_start_time: string | null
  override_end_time: string | null
  is_day_off: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  client_id: string
  barber_id: string
  start_time: string
  end_time: string
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  total_amount: number | null
  notes: string | null
  created_at: string
  updated_at: string
  client?: Client
  barber?: Barber
  services?: AppointmentService[]
}

export interface AppointmentService {
  id: string
  appointment_id: string
  service_id: string
  price_at_booking: number
  duration_at_booking: number
  quantity: number
  created_at: string
  service?: Service
}

export interface DailyCollection {
  id: string
  barber_id: string
  collection_date: string
  total_amount_manually_entered: number
  number_of_appointments: number | null
  notes: string | null
  created_at: string
  updated_at: string
  barber?: Barber
}

export interface Expense {
  id: string
  expense_date: string
  category: string
  description: string
  amount: number
  bill_image_url: string | null
  created_at: string
  updated_at: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}