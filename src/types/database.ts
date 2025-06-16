export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          phone_number: string | null
          email: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone_number?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string | null
          email?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          price: number
          duration_minutes: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          duration_minutes: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          duration_minutes?: number
          description?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      barbers: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          phone_number_work?: string | null
          phone_number_home?: string | null
          email?: string | null
          home_address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          phone_number_work?: string | null
          phone_number_home?: string | null
          email?: string | null
          home_address?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      barber_schedules: {
        Row: {
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
        Insert: {
          id?: string
          barber_id: string
          day_of_week?: number | null
          start_time?: string | null
          end_time?: string | null
          specific_date_override?: string | null
          override_start_time?: string | null
          override_end_time?: string | null
          is_day_off?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barber_id?: string
          day_of_week?: number | null
          start_time?: string | null
          end_time?: string | null
          specific_date_override?: string | null
          override_start_time?: string | null
          override_end_time?: string | null
          is_day_off?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          barber_id: string
          start_time: string
          end_time: string
          status: string
          total_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          barber_id: string
          start_time: string
          end_time: string
          status?: string
          total_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          barber_id?: string
          start_time?: string
          end_time?: string
          status?: string
          total_amount?: number | null
          notes?: string | null
          updated_at?: string
        }
      }
      appointment_services: {
        Row: {
          id: string
          appointment_id: string
          service_id: string
          price_at_booking: number
          duration_at_booking: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          service_id: string
          price_at_booking: number
          duration_at_booking: number
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          service_id?: string
          price_at_booking?: number
          duration_at_booking?: number
          quantity?: number
        }
      }
      daily_collections: {
        Row: {
          id: string
          barber_id: string
          collection_date: string
          total_amount_manually_entered: number
          number_of_appointments: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barber_id: string
          collection_date: string
          total_amount_manually_entered: number
          number_of_appointments?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barber_id?: string
          collection_date?: string
          total_amount_manually_entered?: number
          number_of_appointments?: number | null
          notes?: string | null
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          expense_date: string
          category: string
          description: string
          amount: number
          bill_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expense_date: string
          category: string
          description: string
          amount: number
          bill_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expense_date?: string
          category?: string
          description?: string
          amount?: number
          bill_image_url?: string | null
          updated_at?: string
        }
      }
    }
  }
}