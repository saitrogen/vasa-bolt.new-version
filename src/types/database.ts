export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          barber_id: number
          client_id: number
          created_at: string
          end_time: string
          id: number
          notes: string | null
          rating: number | null
          start_time: string
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          barber_id: number
          client_id: number
          created_at?: string
          end_time: string
          id?: number
          notes?: string | null
          rating?: number | null
          start_time: string
          status: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          barber_id?: number
          client_id?: number
          created_at?: string
          end_time?: string
          id?: number
          notes?: string | null
          rating?: number | null
          start_time?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: number
          created_at: string
          duration_at_booking: number
          id: number
          price_at_booking: number
          quantity: number
          service_id: number
        }
        Insert: {
          appointment_id: number
          created_at?: string
          duration_at_booking: number
          id?: number
          price_at_booking: number
          quantity: number
          service_id: number
        }
        Update: {
          appointment_id?: number
          created_at?: string
          duration_at_booking?: number
          id?: number
          price_at_booking?: number
          quantity?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_schedules: {
        Row: {
          barber_id: number
          created_at: string
          day_of_week: number | null
          end_time: string | null
          id: number
          is_day_off: boolean
          notes: string | null
          override_end_time: string | null
          override_start_time: string | null
          specific_date_override: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          barber_id: number
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: number
          is_day_off?: boolean
          notes?: string | null
          override_end_time?: string | null
          override_start_time?: string | null
          specific_date_override?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          barber_id?: number
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: number
          is_day_off?: boolean
          notes?: string | null
          override_end_time?: string | null
          override_start_time?: string | null
          specific_date_override?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_schedules_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          created_at: string
          email: string | null
          home_address: string | null
          id: number
          is_active: boolean
          name: string
          passport_expiry_date: string | null
          passport_number: string | null
          phone_number_home: string | null
          phone_number_work: string | null
          updated_at: string
          user_id: string | null
          visa_expiry_date: string | null
          visa_number: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          home_address?: string | null
          id?: number
          is_active?: boolean
          name: string
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone_number_home?: string | null
          phone_number_work?: string | null
          updated_at?: string
          user_id?: string | null
          visa_expiry_date?: string | null
          visa_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          home_address?: string | null
          id?: number
          is_active?: boolean
          name?: string
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone_number_home?: string | null
          phone_number_work?: string | null
          updated_at?: string
          user_id?: string | null
          visa_expiry_date?: string | null
          visa_number?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string
          notes: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_collections: {
        Row: {
          barber_id: number
          collection_date: string
          created_at: string
          id: number
          notes: string | null
          number_of_appointments: number | null
          total_amount_manually_entered: number
          updated_at: string
        }
        Insert: {
          barber_id: number
          collection_date: string
          created_at?: string
          id?: number
          notes?: string | null
          number_of_appointments?: number | null
          total_amount_manually_entered: number
          updated_at?: string
        }
        Update: {
          barber_id?: number
          collection_date?: string
          created_at?: string
          id?: number
          notes?: string | null
          number_of_appointments?: number | null
          total_amount_manually_entered?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_collections_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          bill_url: string | null
          category_id: number
          created_at: string
          expense_date: string
          id: number
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bill_url?: string | null
          category_id: number
          created_at?: string
          expense_date: string
          id?: number
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bill_url?: string | null
          category_id?: number
          created_at?: string
          expense_date?: string
          id?: number
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: number
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: number
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: number
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never