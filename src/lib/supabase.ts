import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Wrapper para contornar problemas de tipagem
export const supabase = supabaseClient as any;
