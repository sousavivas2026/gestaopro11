import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import { MonitorAudioControls } from "./MonitorAudioControls";

type ViewType = 'critical' | 'low_stock' | 'purchase_list';

export function ProductsMonitor() {
  const [currentView, setCurrentView] = useState<ViewType>("critical");
  const { playAlert, alertMode } = useSoundAlert();
  
  const views: ViewType[] = ['critical', 'low_stock', 'purchase_list'];
  
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

  const { data: products = [], dataUpdatedAt } = useQuery({
    queryKey: ['products-monitor'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .order('stock_quantity', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });

  const criticalStock = products.filter((p: any) => 
    p.stock_quantity <= (p.minimum_stock / 2) && p.minimum_stock > 0
  );
  const lowStock = products.filter((p: any) => 
    p.stock_quantity <= p.minimum_stock && p.minimum_stock > 0 && !criticalStock.includes(p)
  );
  const purchaseList = products.filter((p: any) => 
    p.stock_quantity <= p.minimum_stock && p.minimum_stock > 0
  );

  useEffect(() => {
    if (criticalStock.length > 0 && alertMode !== 'disabled') {
      playAlert('estoque_baixo');
    }
  }, [dataUpdatedAt, alertMode, playAlert]);

  const getViewTitle = () => {
    switch(currentView) {
      case 'critical': return 'ESTOQUE CRÍTICO';
      case 'low_stock': return 'ESTOQUE BAIXO';
      case 'purchase_list': return 'LISTA DE COMPRAS';
    }
  };

  const getViewIcon = () => {
    switch(currentView) {
      case 'critical': return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 'low_stock': return <Package className="w-16 h-16 text-yellow-500" />;
      case 'purchase_list': return <ShoppingCart className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getCurrentProducts = () => {
    switch(currentView) {
      case 'critical': return criticalStock;
      case 'low_stock': return lowStock;
      case 'purchase_list': return purchaseList;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-8">
      <MonitorAudioControls context="products" />
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
          {getCurrentProducts().length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-24 h-24 mx-auto mb-6 text-slate-600" />
              <p className="text-3xl text-slate-400">
                {currentView === 'critical' ? 'Nenhum produto crítico!' : 
                 currentView === 'low_stock' ? 'Estoque adequado!' : 
                 'Lista de compras vazia!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentProducts().map((product: any) => (
                <Card key={product.id} className={`bg-gradient-to-br ${
                  currentView === 'critical' ? 'from-yellow-900 to-amber-800 border-yellow-600' :
                  'from-yellow-900 to-amber-800 border-yellow-600'
                } border-2 shadow-2xl`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      {currentView === 'critical' ? 
                        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" /> :
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                      }
                      <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-yellow-200 mb-4">{product.sku || 'Sem SKU'}</p>
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <p className="text-yellow-300 text-lg">Estoque Atual</p>
                        <p className="text-4xl font-bold text-white">{product.stock_quantity}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <p className="text-yellow-300 text-lg">Estoque Mínimo</p>
                        <p className="text-3xl font-bold text-white">{product.minimum_stock}</p>
                      </div>
                      {product.location && (
                        <p className="text-yellow-300 text-sm">Local: {product.location}</p>
                      )}
                      <Badge className={`mt-3 text-lg px-4 py-2 ${
                        currentView === 'critical' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}>
                        {currentView === 'critical' ? 'CRÍTICO' : 'COMPRAR'}
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
