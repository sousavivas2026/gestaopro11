import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { 
  Cake, 
  AlertCircle, 
  DollarSign, 
  Wrench, 
  ShoppingBag,
  TrendingUp,
  Package,
  Factory,
  Wallet,
  Award
} from "lucide-react";
import { format, differenceInDays, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import MarketplaceSlide from "@/components/monitor/MarketplaceSlide";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import { MonitorAudioControls } from "./MonitorAudioControls";

type ViewType = 
  | 'marketplace' 
  | 'expenses' 
  | 'birthdays' 
  | 'daily_sales'
  | 'low_stock'
  | 'pending_services'
  | 'production_orders'
  | 'revenue_expenses'
  | 'top_products'
  | 'financial_summary';

export function ManagementMonitor() {
  const [currentView, setCurrentView] = useState<ViewType>("marketplace");
  const { playAlert } = useSoundAlert();
  
  const views: ViewType[] = [
    'marketplace',
    'expenses', 
    'birthdays',
    'daily_sales',
    'low_stock',
    'pending_services',
    'production_orders',
    'revenue_expenses',
    'top_products',
    'financial_summary'
  ];
  
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
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      const today = new Date();
      return (data || []).filter((exp: any) => {
        if (!exp.due_date || exp.paid) return false;
        const dueDate = parseISO(exp.due_date);
        const daysUntil = differenceInDays(dueDate, today);
        return daysUntil >= -2 && daysUntil <= 7;
      }).sort((a: any, b: any) => differenceInDays(parseISO(a.due_date), parseISO(b.due_date)));
    },
    refetchInterval: 5000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) throw error;
      const today = new Date();
      return (data || []).filter((emp: any) => {
        if (!emp.birth_date) return false;
        const birthDate = parseISO(emp.birth_date);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const daysUntil = differenceInDays(thisYearBirthday, today);
        return daysUntil >= 0 && daysUntil <= 30;
      }).sort((a: any, b: any) => {
        const dateA = parseISO(a.birth_date);
        const dateB = parseISO(b.birth_date);
        const todayA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
        const todayB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
        return differenceInDays(todayA, today) - differenceInDays(todayB, today);
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

  // Vendas do Dia
  const { data: dailySales = [] } = useQuery({
    queryKey: ['daily-sales-monitor'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('sale_date', today);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  // Produtos em Estoque Baixo
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['low-stock-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock_quantity', supabase.raw('minimum_stock'))
        .order('stock_quantity', { ascending: true })
        .limit(9);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  // Serviços Pendentes
  const { data: pendingServices = [] } = useQuery({
    queryKey: ['pending-services-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'pendente')
        .order('service_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  // Ordens de Produção Pendentes
  const { data: pendingProduction = [] } = useQuery({
    queryKey: ['pending-production-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*')
        .in('status', ['pendente', 'em_andamento'])
        .order('priority', { ascending: false })
        .limit(9);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  // Receitas vs Despesas (Mês Atual)
  const { data: monthlyFinancials } = useQuery({
    queryKey: ['monthly-financials-monitor'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const monthStart = format(startOfMonth, 'yyyy-MM-dd');
      
      const [salesResult, expensesResult, servicesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('total_revenue')
          .gte('sale_date', monthStart),
        supabase
          .from('expenses')
          .select('value')
          .gte('expense_date', monthStart),
        supabase
          .from('services')
          .select('total_value')
          .gte('service_date', monthStart)
      ]);

      const totalSales = (salesResult.data || []).reduce((sum: number, s: any) => sum + (s.total_revenue || 0), 0);
      const totalServices = (servicesResult.data || []).reduce((sum: number, s: any) => sum + (s.total_value || 0), 0);
      const totalExpenses = (expensesResult.data || []).reduce((sum: number, e: any) => sum + (e.value || 0), 0);

      return {
        revenue: totalSales + totalServices,
        expenses: totalExpenses,
        profit: (totalSales + totalServices) - totalExpenses
      };
    },
    refetchInterval: 10000,
  });

  // Top 5 Produtos Mais Vendidos
  const { data: topProducts = [] } = useQuery({
    queryKey: ['top-products-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('product_name, quantity, total_revenue')
        .order('quantity', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Agrupar por produto
      const productMap = new Map();
      (data || []).forEach((sale: any) => {
        const existing = productMap.get(sale.product_name) || { quantity: 0, revenue: 0 };
        productMap.set(sale.product_name, {
          name: sale.product_name,
          quantity: existing.quantity + sale.quantity,
          revenue: existing.revenue + (sale.total_revenue || 0)
        });
      });
      
      return Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
    refetchInterval: 10000,
  });

  const totalDailySales = dailySales.reduce((sum: number, sale: any) => sum + (sale.total_revenue || 0), 0);
  const totalDailyProfit = dailySales.reduce((sum: number, sale: any) => sum + (sale.profit || 0), 0);
  const totalPendingServices = pendingServices.reduce((sum: number, service: any) => sum + (service.total_value || 0), 0);

  const getViewTitle = () => {
    switch(currentView) {
      case 'marketplace': return 'PEDIDOS MARKETPLACE';
      case 'expenses': return 'PAGAMENTOS URGENTES';
      case 'birthdays': return 'ANIVERSARIANTES';
      case 'daily_sales': return 'VENDAS DO DIA';
      case 'low_stock': return 'ESTOQUE BAIXO';
      case 'pending_services': return 'SERVIÇOS PENDENTES';
      case 'production_orders': return 'ORDENS DE PRODUÇÃO';
      case 'revenue_expenses': return 'RECEITAS VS DESPESAS';
      case 'top_products': return 'TOP 5 PRODUTOS';
      case 'financial_summary': return 'RESUMO FINANCEIRO';
    }
  };

  const getViewIcon = () => {
    switch(currentView) {
      case 'marketplace': return <ShoppingBag className="w-16 h-16 text-purple-400" />;
      case 'expenses': return <AlertCircle className="w-16 h-16 text-red-400" />;
      case 'birthdays': return <Cake className="w-16 h-16 text-pink-400" />;
      case 'daily_sales': return <TrendingUp className="w-16 h-16 text-green-400" />;
      case 'low_stock': return <Package className="w-16 h-16 text-orange-400" />;
      case 'pending_services': return <Wrench className="w-16 h-16 text-blue-400" />;
      case 'production_orders': return <Factory className="w-16 h-16 text-violet-400" />;
      case 'revenue_expenses': return <DollarSign className="w-16 h-16 text-emerald-400" />;
      case 'top_products': return <Award className="w-16 h-16 text-yellow-400" />;
      case 'financial_summary': return <Wallet className="w-16 h-16 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <MonitorAudioControls context="management" />
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

          {currentView === 'daily_sales' && (
            <>
              {dailySales.length === 0 ? (
                <div className="text-center py-20">
                  <TrendingUp className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Nenhuma venda registrada hoje!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-900 to-emerald-900 border-2 border-green-600 shadow-2xl col-span-full">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-green-300 text-xl">Total de Vendas</p>
                          <p className="text-5xl font-bold text-white">{dailySales.length}</p>
                        </div>
                        <div>
                          <p className="text-green-300 text-xl">Faturamento</p>
                          <p className="text-5xl font-bold text-white">R$ {totalDailySales.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-green-300 text-xl">Lucro</p>
                          <p className="text-5xl font-bold text-white">R$ {totalDailyProfit.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {dailySales.slice(0, 6).map((sale: any) => (
                    <Card key={sale.id} className="bg-gradient-to-br from-green-800 to-teal-900 border-2 border-green-500 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-300" />
                          <h3 className="text-xl font-bold text-white mb-2">{sale.product_name}</h3>
                          <p className="text-green-200 mb-2">{sale.customer_name || 'Cliente não informado'}</p>
                          <div className="bg-black/30 rounded-lg p-3 mb-2">
                            <p className="text-green-300">Quantidade</p>
                            <p className="text-3xl font-bold text-white">{sale.quantity}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-green-300">Valor</p>
                            <p className="text-2xl font-bold text-white">R$ {(sale.total_revenue || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'low_stock' && (
            <>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Estoque adequado!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lowStockProducts.map((product: any) => (
                    <Card key={product.id} className="bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-600 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Package className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                          <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                          <p className="text-orange-200 mb-4">{product.sku || 'Sem SKU'}</p>
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <p className="text-red-300 text-lg">Estoque Atual</p>
                            <p className="text-4xl font-bold text-white">{product.stock_quantity}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-orange-300 text-lg">Estoque Mínimo</p>
                            <p className="text-3xl font-bold text-white">{product.minimum_stock}</p>
                          </div>
                          {product.location && (
                            <p className="text-orange-300 text-sm mt-2">Local: {product.location}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'pending_services' && (
            <>
              {pendingServices.length === 0 ? (
                <div className="text-center py-20">
                  <Wrench className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Nenhum serviço pendente!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 border-2 border-blue-600 shadow-2xl col-span-full">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-blue-300 text-xl">Serviços Pendentes</p>
                          <p className="text-5xl font-bold text-white">{pendingServices.length}</p>
                        </div>
                        <div>
                          <p className="text-blue-300 text-xl">Valor Total</p>
                          <p className="text-5xl font-bold text-white">R$ {totalPendingServices.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {pendingServices.slice(0, 6).map((service: any) => (
                    <Card key={service.id} className="bg-gradient-to-br from-blue-800 to-indigo-900 border-2 border-blue-500 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Wrench className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                          <h3 className="text-xl font-bold text-white mb-2">{service.service_type}</h3>
                          <p className="text-blue-200 mb-2">{service.customer_name}</p>
                          <p className="text-blue-300 text-sm mb-3">
                            {format(parseISO(service.service_date), "dd/MM/yyyy")}
                          </p>
                          <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-blue-300">Valor</p>
                            <p className="text-2xl font-bold text-white">R$ {(service.total_value || 0).toFixed(2)}</p>
                          </div>
                          {service.employee_name && (
                            <p className="text-blue-300 text-sm mt-2">{service.employee_name}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'production_orders' && (
            <>
              {pendingProduction.length === 0 ? (
                <div className="text-center py-20">
                  <Factory className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Nenhuma ordem pendente!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingProduction.map((order: any) => (
                    <Card key={order.id} className="bg-gradient-to-br from-violet-900 to-purple-900 border-2 border-violet-600 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Factory className="w-16 h-16 mx-auto mb-4 text-violet-300" />
                          <h3 className="text-2xl font-bold text-white mb-2">{order.order_number}</h3>
                          <p className="text-violet-200 mb-4">{order.product_name}</p>
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <p className="text-violet-300 text-lg">Quantidade</p>
                            <p className="text-4xl font-bold text-white">{order.quantity}</p>
                          </div>
                          {order.employee_name && (
                            <p className="text-violet-300 text-sm mb-2">Responsável: {order.employee_name}</p>
                          )}
                          <Badge className={`text-lg px-4 py-2 ${
                            order.status === 'pendente' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {order.status === 'pendente' ? 'Pendente' : 'Em Andamento'}
                          </Badge>
                          {order.priority && order.priority !== 'normal' && (
                            <Badge className="ml-2 bg-red-500 text-lg px-4 py-2">
                              {order.priority === 'alta' ? 'URGENTE' : 'Prioridade'}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'revenue_expenses' && monthlyFinancials && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-emerald-900 to-green-900 border-2 border-emerald-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Receitas</h3>
                    <p className="text-emerald-200 mb-4">Vendas + Serviços</p>
                    <p className="text-5xl font-bold text-white">R$ {monthlyFinancials.revenue.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-900 to-orange-900 border-2 border-red-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Despesas</h3>
                    <p className="text-red-200 mb-4">Total do mês</p>
                    <p className="text-5xl font-bold text-white">R$ {monthlyFinancials.expenses.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={`bg-gradient-to-br ${
                monthlyFinancials.profit >= 0 
                  ? 'from-cyan-900 to-blue-900 border-cyan-600' 
                  : 'from-orange-900 to-red-900 border-orange-600'
              } border-2 shadow-2xl`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-cyan-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {monthlyFinancials.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                    </h3>
                    <p className="text-cyan-200 mb-4">Saldo do mês</p>
                    <p className={`text-5xl font-bold ${
                      monthlyFinancials.profit >= 0 ? 'text-white' : 'text-orange-300'
                    }`}>
                      R$ {Math.abs(monthlyFinancials.profit).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'top_products' && (
            <>
              {topProducts.length === 0 ? (
                <div className="text-center py-20">
                  <Award className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                  <p className="text-3xl text-slate-400">Nenhuma venda registrada!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topProducts.map((product: any, index: number) => (
                    <Card key={index} className={`bg-gradient-to-br ${
                      index === 0 ? 'from-yellow-900 to-amber-900 border-yellow-600' :
                      index === 1 ? 'from-gray-700 to-gray-900 border-gray-500' :
                      index === 2 ? 'from-orange-900 to-amber-900 border-orange-600' :
                      'from-blue-900 to-indigo-900 border-blue-600'
                    } border-2 shadow-2xl`}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Award className={`w-16 h-16 mx-auto mb-4 ${
                            index === 0 ? 'text-yellow-300' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-300' :
                            'text-blue-300'
                          }`} />
                          <div className="text-4xl font-bold text-white mb-2">#{index + 1}</div>
                          <h3 className="text-2xl font-bold text-white mb-4">{product.name}</h3>
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <p className="text-yellow-300 text-lg">Quantidade Vendida</p>
                            <p className="text-4xl font-bold text-white">{product.quantity}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-yellow-300 text-lg">Faturamento</p>
                            <p className="text-3xl font-bold text-white">R$ {(product.revenue || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'financial_summary' && monthlyFinancials && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-2 border-cyan-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <Wallet className="w-20 h-20 mx-auto mb-4 text-cyan-300" />
                    <h2 className="text-4xl font-bold text-white mb-2">Resumo Financeiro</h2>
                    <p className="text-cyan-200 text-xl">
                      {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-900/50 rounded-lg p-6 text-center">
                      <p className="text-emerald-300 text-2xl mb-2">Receitas</p>
                      <p className="text-5xl font-bold text-white">R$ {monthlyFinancials.revenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-900/50 rounded-lg p-6 text-center">
                      <p className="text-red-300 text-2xl mb-2">Despesas</p>
                      <p className="text-5xl font-bold text-white">R$ {monthlyFinancials.expenses.toFixed(2)}</p>
                    </div>
                    <div className={`${
                      monthlyFinancials.profit >= 0 ? 'bg-cyan-900/50' : 'bg-orange-900/50'
                    } rounded-lg p-6 text-center`}>
                      <p className={`${
                        monthlyFinancials.profit >= 0 ? 'text-cyan-300' : 'text-orange-300'
                      } text-2xl mb-2`}>
                        {monthlyFinancials.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                      </p>
                      <p className="text-5xl font-bold text-white">
                        R$ {Math.abs(monthlyFinancials.profit).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-900 to-emerald-900 border-2 border-green-600 shadow-2xl">
                  <CardContent className="pt-6 text-center">
                    <p className="text-green-300 text-xl mb-2">Vendas Hoje</p>
                    <p className="text-4xl font-bold text-white">{dailySales.length}</p>
                    <p className="text-green-200 text-lg mt-2">R$ {totalDailySales.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 border-2 border-blue-600 shadow-2xl">
                  <CardContent className="pt-6 text-center">
                    <p className="text-blue-300 text-xl mb-2">Serviços Pendentes</p>
                    <p className="text-4xl font-bold text-white">{pendingServices.length}</p>
                    <p className="text-blue-200 text-lg mt-2">R$ {totalPendingServices.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-600 shadow-2xl">
                  <CardContent className="pt-6 text-center">
                    <p className="text-orange-300 text-xl mb-2">Estoque Baixo</p>
                    <p className="text-4xl font-bold text-white">{lowStockProducts.length}</p>
                    <p className="text-orange-200 text-lg mt-2">Produtos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
