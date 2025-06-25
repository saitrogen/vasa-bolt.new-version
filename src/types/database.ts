export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: number
          name: string
          phone_number: string | null
          email: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          phone_number?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          phone_number?: string | null
          email?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: number
          name: string
          price: number
          duration_minutes: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          duration_minutes: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
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
          id: number
          user_id: string | null
          name: string
          phone_number_work: string | null
          phone_number_home: string | null
          email: string | null
          home_address: string | null
          is_active: boolean
          visa_number: string | null
          visa_expiry_date: string | null
          passport_number: string | null
          passport_expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          name: string
          phone_number_work?: string | null
          phone_number_home?: string | null
          email?: string | null
          home_address?: string | null
          is_active?: boolean
          visa_number?: string | null
          visa_expiry_date?: string | null
          passport_number?: string | null
          passport_expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          name?: string
          phone_number_work?: string | null
          phone_number_home?: string | null
          email?: string | null
          home_address?: string | null
          is_active?: boolean
          visa_number?: string | null
          visa_expiry_date?: string | null
          passport_number?: string | null
          passport_expiry_date?: string | null
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
          id: number
          client_id: number
          barber_id: number
          start_time: string
          end_time: string
          status: string
          total_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          client_id: number
          barber_id: number
          start_time: string
          end_time: string
          status?: string
          total_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          client_id?: number
          barber_id?: number
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
          id: number
          appointment_id: number
          service_id: number
          price_at_booking: number
          duration_at_booking: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: number
          appointment_id: number
          service_id: number
          price_at_booking: number
          duration_at_booking: number
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: number
          appointment_id?: number
          service_id?: number
          price_at_booking?: number
          duration_at_booking?: number
          quantity?: number
        }
      }
      daily_collections: {
        Row: {
          id: number
          barber_id: number
          collection_date: string
          total_amount_manually_entered: number
          number_of_appointments: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          barber_id: number
          collection_date: string
          total_amount_manually_entered: number
          number_of_appointments?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          barber_id?: number
          collection_date?: string
          total_amount_manually_entered?: number
          number_of_appointments?: number | null
          notes?: string | null
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: number
          expense_date: string
          category: string
          description: string
          amount: number
          bill_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          expense_date: string
          category: string
          description: string
          amount: number
          bill_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
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