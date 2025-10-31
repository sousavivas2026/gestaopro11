import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth } from "date-fns";

export function useDashboardData() {
  const currentMonth = new Date();

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['dashboard-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
        .lte('sale_date', format(endOfMonth(currentMonth), 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['dashboard-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
        .lte('expense_date', format(endOfMonth(currentMonth), 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar movimentações de caixa
  const { data: cashMovements = [], isLoading: loadingCash } = useQuery({
    queryKey: ['dashboard-cash-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('category', 'Movimentação Caixa')
        .gte('expense_date', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
        .lte('expense_date', format(endOfMonth(currentMonth), 'yyyy-MM-dd'))
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const totalEntradas = sales.reduce((sum: number, s: any) => sum + (s.total_revenue || 0), 0);
  const totalSaidas = expenses.reduce((sum: number, e: any) => sum + (e.value || 0), 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  // Calcular entradas de caixa manual
  const entradasCaixa = cashMovements
    .filter((m: any) => m.description?.startsWith('Entrada'))
    .reduce((sum: number, m: any) => sum + (m.value || 0), 0);

  return {
    sales,
    expenses,
    cashMovements,
    totalEntradas,
    totalSaidas,
    saldoCaixa,
    entradasCaixa,
    isLoading: loadingSales || loadingExpenses || loadingCash,
  };
}
