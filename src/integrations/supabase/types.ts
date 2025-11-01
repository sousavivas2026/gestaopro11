export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          cpf_cnpj: string | null
          created_date: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_date: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_date?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_date?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_date?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_date?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean | null
          address: string | null
          birth_date: string | null
          city: string | null
          cpf: string | null
          created_date: string | null
          email: string | null
          hire_date: string | null
          id: string
          name: string
          phone: string | null
          role: string | null
          salary: number | null
          state: string | null
          updated_date: string | null
          zip_code: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_date?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          salary?: number | null
          state?: string | null
          updated_date?: string | null
          zip_code?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_date?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          salary?: number | null
          state?: string | null
          updated_date?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          category: string
          created_date: string | null
          description: string
          due_date: string | null
          expense_date: string
          id: string
          notes: string | null
          paid: boolean | null
          payment_method: string | null
          supplier_id: string | null
          supplier_name: string | null
          updated_date: string | null
          value: number
        }
        Insert: {
          category: string
          created_date?: string | null
          description: string
          due_date?: string | null
          expense_date?: string
          id?: string
          notes?: string | null
          paid?: boolean | null
          payment_method?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          updated_date?: string | null
          value: number
        }
        Update: {
          category?: string
          created_date?: string | null
          description?: string
          due_date?: string | null
          expense_date?: string
          id?: string
          notes?: string | null
          paid?: boolean | null
          payment_method?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          updated_date?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_date: string | null
          customer_id: string | null
          customer_name: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_method: string | null
          status: string | null
          supplier_id: string | null
          supplier_name: string | null
          tax_value: number | null
          total_value: number
          type: string
          updated_date: string | null
        }
        Insert: {
          created_date?: string | null
          customer_id?: string | null
          customer_name?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          tax_value?: number | null
          total_value: number
          type: string
          updated_date?: string | null
        }
        Update: {
          created_date?: string | null
          customer_id?: string | null
          customer_name?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          tax_value?: number | null
          total_value?: number
          type?: string
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      machines_vehicles: {
        Row: {
          brand: string | null
          created_date: string | null
          id: string
          last_maintenance: string | null
          location: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          notes: string | null
          purchase_date: string | null
          purchase_value: number | null
          serial_number: string | null
          status: string | null
          type: string
          updated_date: string | null
        }
        Insert: {
          brand?: string | null
          created_date?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          serial_number?: string | null
          status?: string | null
          type: string
          updated_date?: string | null
        }
        Update: {
          brand?: string | null
          created_date?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          serial_number?: string | null
          status?: string | null
          type?: string
          updated_date?: string | null
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          completed_by: string | null
          created_date: string | null
          customer_name: string
          id: string
          integration: string | null
          items: Json
          order_number: string
          status: string
          updated_date: string | null
        }
        Insert: {
          completed_by?: string | null
          created_date?: string | null
          customer_name: string
          id?: string
          integration?: string | null
          items?: Json
          order_number: string
          status?: string
          updated_date?: string | null
        }
        Update: {
          completed_by?: string | null
          created_date?: string | null
          customer_name?: string
          id?: string
          integration?: string | null
          items?: Json
          order_number?: string
          status?: string
          updated_date?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_date: string | null
          description: string | null
          id: string
          location: string | null
          material_name: string
          minimum_quantity: number | null
          quantity: number
          supplier_id: string | null
          unit: string
          unit_price: number | null
          updated_date: string | null
        }
        Insert: {
          created_date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          material_name: string
          minimum_quantity?: number | null
          quantity?: number
          supplier_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_date?: string | null
        }
        Update: {
          created_date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          material_name?: string
          minimum_quantity?: number | null
          quantity?: number
          supplier_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          created_date: string | null
          employee_id: string | null
          employee_name: string | null
          end_date: string | null
          id: string
          notes: string | null
          order_number: string
          priority: string | null
          product_id: string | null
          product_name: string
          quantity: number
          start_date: string | null
          status: string
          updated_date: string | null
        }
        Insert: {
          created_date?: string | null
          employee_id?: string | null
          employee_name?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          priority?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          start_date?: string | null
          status?: string
          updated_date?: string | null
        }
        Update: {
          created_date?: string | null
          employee_id?: string | null
          employee_name?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          priority?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          start_date?: string | null
          status?: string
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          cost_price: number
          created_date: string | null
          description: string | null
          id: string
          location: string | null
          minimum_stock: number | null
          name: string
          sku: string | null
          stock_quantity: number
          supplier_id: string | null
          unit_price: number
          updated_date: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost_price?: number
          created_date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          minimum_stock?: number | null
          name: string
          sku?: string | null
          stock_quantity?: number
          supplier_id?: string | null
          unit_price?: number
          updated_date?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost_price?: number
          created_date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          minimum_stock?: number | null
          name?: string
          sku?: string | null
          stock_quantity?: number
          supplier_id?: string | null
          unit_price?: number
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cost_price: number | null
          created_date: string | null
          customer_id: string | null
          customer_name: string | null
          id: string
          notes: string | null
          payment_method: string | null
          product_id: string | null
          product_name: string
          profit: number | null
          quantity: number
          sale_date: string
          total_cost: number | null
          total_revenue: number
          unit_price: number
          updated_date: string | null
        }
        Insert: {
          cost_price?: number | null
          created_date?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name: string
          profit?: number | null
          quantity?: number
          sale_date?: string
          total_cost?: number | null
          total_revenue: number
          unit_price: number
          updated_date?: string | null
        }
        Update: {
          cost_price?: number | null
          created_date?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name?: string
          profit?: number | null
          quantity?: number
          sale_date?: string
          total_cost?: number | null
          total_revenue?: number
          unit_price?: number
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          cost: number | null
          created_date: string | null
          customer_id: string | null
          customer_name: string
          description: string | null
          employee_id: string | null
          employee_name: string | null
          id: string
          notes: string | null
          payment_method: string | null
          profit: number | null
          service_date: string
          service_type: string
          status: string | null
          total_value: number
          updated_date: string | null
        }
        Insert: {
          cost?: number | null
          created_date?: string | null
          customer_id?: string | null
          customer_name: string
          description?: string | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          profit?: number | null
          service_date?: string
          service_type: string
          status?: string | null
          total_value: number
          updated_date?: string | null
        }
        Update: {
          cost?: number | null
          created_date?: string | null
          customer_id?: string | null
          customer_name?: string
          description?: string | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          profit?: number | null
          service_date?: string
          service_type?: string
          status?: string | null
          total_value?: number
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          contact_person: string | null
          created_date: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_date: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_date?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_date?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_date?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_date?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          permissoes: Json | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          permissoes?: Json | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          permissoes?: Json | null
          tipo?: string | null
          updated_at?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
