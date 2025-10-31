import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Cake, AlertCircle, DollarSign, Wrench, ShoppingBag } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import MarketplaceSlide from "@/components/monitor/MarketplaceSlide";
import { initializeMarketplaceStorage } from "@/utils/marketplaceSync";

type ViewType = 'marketplace' | 'expenses' | 'birthdays' | 'services_summary';

export function ManagementMonitor() {
  const [currentView, setCurrentView] = useState<ViewType>("marketplace");
  
  const views: ViewType[] = ['marketplace', 'expenses', 'birthdays', 'services_summary'];
  
  useEffect(() => {
    initializeMarketplaceStorage();
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => {
        const currentIndex = views.indexOf(prev);
        const nextIndex = (currentIndex + 1) % views.length;
        return views[nextIndex];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [views]);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('due_date');
      if (error) throw error;
      const today = new Date();
      return (data || []).filter((exp: any) => {
        if (!exp.due_date || exp.status === 'paid') return false;
        const dueDate = parseISO(exp.due_date);
        const daysUntil = differenceInDays(dueDate, today);
        return daysUntil >= -2 && daysUntil <= 7;
      });
    },
    refetchInterval: 5000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*').order('birth_date');
      if (error) throw error;
      const today = new Date();
      return (data || []).filter((emp: any) => {
        if (!emp.birth_date) return false;
        const birthDate = parseISO(emp.birth_date);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const daysUntil = differenceInDays(thisYearBirthday, today);
        return daysUntil >= 0 && daysUntil <= 30;
      });
    },
    refetchInterval: 5000,
  });

  const { data: servicesData = [] } = useQuery({
    queryKey: ['services-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*');
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  const totalServices = servicesData.reduce((sum: number, service: any) => sum + (service.total_value || 0), 0);

  const getViewTitle = () => {
    switch(currentView) {
      case 'marketplace': return 'PEDIDOS MARKETPLACE';
      case 'expenses': return 'PAGAMENTOS URGENTES';
      case 'birthdays': return 'ANIVERSARIANTES';
      case 'services_summary': return 'RESUMO DE SERVIÇOS';
    }
  };

  const getViewIcon = () => {
    switch(currentView) {
      case 'marketplace': return <ShoppingBag className="w-16 h-16 text-purple-400" />;
      case 'expenses': return <AlertCircle className="w-16 h-16 text-red-400" />;
      case 'birthdays': return <Cake className="w-16 h-16 text-pink-400" />;
      case 'services_summary': return <Wrench className="w-16 h-16 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {getViewIcon()}
            <h1 className="text-6xl font-bold text-white">{getViewTitle()}</h1>
          </div>
          <p className="text-2xl text-slate-300">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {views.map((view) => (
              <div 
                key={view}
                className={`w-3 h-3 rounded-full ${currentView === view ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {currentView === 'marketplace' && <MarketplaceSlide />}
          
          {currentView === 'expenses' && (
            <>
              {expenses.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Nenhuma conta pendente!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expenses.map((expense: any) => {
                    const dueDate = parseISO(expense.due_date);
                    const daysUntil = differenceInDays(dueDate, new Date());
                    let urgency = "Em Dia";
                    let urgencyColor = "text-green-300";
                    if (daysUntil < 0) {
                      urgency = "Urgente";
                      urgencyColor = "text-red-300";
                    } else if (daysUntil <= 2) {
                      urgency = "Próximo";
                      urgencyColor = "text-yellow-300";
                    }

                    return (
                      <Card key={expense.id} className="bg-gradient-to-br from-red-900 to-orange-900 border-2 border-red-600 shadow-2xl">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
                            <h3 className="text-2xl font-bold text-white mb-2">{expense.description}</h3>
                            <p className="text-orange-200 mb-4">
                              Vencimento em {format(dueDate, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 mb-4">
                              <p className="text-red-300 text-lg">Valor</p>
                              <p className="text-4xl font-bold text-white">R$ {expense.amount}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-4">
                              <p className={urgencyColor + " text-lg"}>Status</p>
                              <p className="text-3xl font-bold text-white">{urgency}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
          
          {currentView === 'birthdays' && (
            <>
              {employees.length === 0 ? (
                <div className="text-center py-20">
                  <Cake className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Nenhum aniversariante no próximo mês!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employees.map((employee: any) => {
                    const birthDate = parseISO(employee.birth_date);
                    const today = new Date();
                    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                    const daysUntil = differenceInDays(thisYearBirthday, today);

                    return (
                      <Card key={employee.id} className="bg-gradient-to-br from-pink-900 to-red-900 border-2 border-pink-600 shadow-2xl">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Cake className="w-16 h-16 mx-auto mb-4 text-pink-300" />
                            <h3 className="text-2xl font-bold text-white mb-2">{employee.name}</h3>
                            <p className="text-pink-200 mb-4">
                              Aniversário em {format(birthDate, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                            <div className="bg-black/30 rounded-lg p-4">
                              <p className="text-red-300 text-lg">Faltam</p>
                              <p className="text-4xl font-bold text-white">{daysUntil} dias</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {currentView === 'services_summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 border-2 border-indigo-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wrench className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Total de Serviços</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalServices.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
