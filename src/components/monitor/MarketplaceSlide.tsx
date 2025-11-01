import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, CheckCircle2, Package, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSoundAlert } from "@/contexts/SoundAlertContext";

export default function MarketplaceSlide() {
  const { playAlert, alertMode } = useSoundAlert();

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ['marketplace-orders-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*')
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  const pendingOrders = orders.filter(o => o.status === 'pendente');

  useEffect(() => {
    if (pendingOrders.length > 0 && alertMode === 'on-order') {
      playAlert('novo_pedido');
    }
  }, [dataUpdatedAt, alertMode, playAlert]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: { label: "Pendente", className: "bg-yellow-500", icon: Clock },
      separando: { label: "Separando", className: "bg-blue-500", icon: Package },
      concluido: { label: "Concluído", className: "bg-green-500", icon: CheckCircle2 }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  return (
    <div className="space-y-8">
      {pendingOrders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-slate-600" />
          <p className="text-3xl text-slate-400">Nenhum pedido pendente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingOrders.slice(0, 6).map((order: any) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card 
                key={order.id}
                className="bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-purple-600 shadow-2xl"
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <StatusIcon className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">{order.order_number}</h3>
                    <p className="text-purple-200 mb-4">{order.customer_name}</p>
                    
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-black/30 rounded-lg p-3">
                          <p className="text-white font-semibold">{item.product}</p>
                          <p className="text-green-400 text-xl font-bold">Qtd: {item.quantity}</p>
                          {item.location && (
                            <div className="flex items-center justify-center gap-1 mt-2 text-blue-300">
                              <MapPin className="w-3 h-3" />
                              <p className="text-xs">{item.location}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Badge className={`${statusConfig.className} text-white text-lg px-4 py-2`}>
                      {statusConfig.label}
                    </Badge>
                    
                    <p className="text-purple-300 text-sm mt-3">
                      {order.created_date && format(new Date(order.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
