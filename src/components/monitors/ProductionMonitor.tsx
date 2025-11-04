import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import { MonitorAudioControls } from "./MonitorAudioControls";

type ViewType = 'pending' | 'in_progress' | 'completed';

export function ProductionMonitor() {
  const [currentView, setCurrentView] = useState<ViewType>("pending");
  const { playAlert, alertMode } = useSoundAlert();
  
  const views: ViewType[] = ['pending', 'in_progress', 'completed'];
  
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

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ['production-monitor'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('production_orders')
        .select('*')
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  const pendingOrders = orders.filter((o: any) => o.status === 'pendente');
  const inProgressOrders = orders.filter((o: any) => o.status === 'em_andamento');
  const completedOrders = orders.filter((o: any) => o.status === 'concluido');

  useEffect(() => {
    if (pendingOrders.length > 0 && alertMode !== 'disabled') {
      playAlert('atencao_maquina');
    }
  }, [dataUpdatedAt, alertMode, playAlert]);

  const getViewTitle = () => {
    switch(currentView) {
      case 'pending': return 'ORDENS PENDENTES';
      case 'in_progress': return 'EM PRODUÇÃO';
      case 'completed': return 'ORDENS CONCLUÍDAS';
    }
  };

  const getViewIcon = () => {
    switch(currentView) {
      case 'pending': return <Clock className="w-16 h-16 text-purple-400" />;
      case 'in_progress': return <Factory className="w-16 h-16 text-purple-400" />;
      case 'completed': return <CheckCircle2 className="w-16 h-16 text-purple-400" />;
    }
  };

  const getCurrentOrders = () => {
    switch(currentView) {
      case 'pending': return pendingOrders;
      case 'in_progress': return inProgressOrders;
      case 'completed': return completedOrders;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <MonitorAudioControls context="production" />
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
          {getCurrentOrders().length === 0 ? (
            <div className="text-center py-20">
              <Factory className="w-24 h-24 mx-auto mb-6 text-slate-600" />
              <p className="text-3xl text-slate-400">Nenhuma ordem nesta categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentOrders().map((order: any) => (
                <Card key={order.id} className="bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-purple-600 shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Factory className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                      <h3 className="text-2xl font-bold text-white mb-2">{order.order_number}</h3>
                      <p className="text-purple-200 mb-4">{order.product_name}</p>
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <p className="text-blue-300 text-lg">Quantidade</p>
                        <p className="text-4xl font-bold text-white">{order.quantity}</p>
                      </div>
                      {order.employee_name && (
                        <p className="text-purple-300 text-sm">Responsável: {order.employee_name}</p>
                      )}
                      <Badge className={`mt-3 text-lg px-4 py-2 ${
                        order.status === 'pendente' ? 'bg-yellow-500' :
                        order.status === 'em_andamento' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {order.status === 'pendente' ? 'Pendente' :
                         order.status === 'em_andamento' ? 'Em Produção' : 'Concluído'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
