import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Package, ShoppingCart, Wrench, ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const chartData = [
  { product: "Fliperama metal - 1player", value: 1800 },
  { product: "pesinho - para fliperama", value: 1500 },
  { product: "borrachinha - do pesinho", value: 1200 },
  { product: "pesinho - para fliperama", value: 800 },
  { product: "Fliperama metal - 2 players", value: 400 },
];

const recentSales = [
  { product: "controle metal - 2 players", qty: 2, value: "R$ 1.222,54", profit: "R$ 1.440,50" },
  { product: "controle metal - 2 players", qty: 2, value: "R$ 1.222,54", profit: "R$ 1.440,50" },
  { product: "Fliperama metal - 1player", qty: 1, value: "R$ 550,00", profit: "R$ 1.200,00" },
  { product: "Fliperama metal - 2 players", qty: 5, value: "R$ 4.318,35", profit: "R$ 1.280,60" },
  { product: "trava lateral - para fliperama", qty: 200, value: "R$ 2000,00", profit: "R$ 1.600,00" },
];

const recentServices = [
  { name: "Injeção de Peças Plásticas", client: "teste teste teste", qty: 1, value: "R$ 0,00", hours: "5.000Hrs" },
];

export default function Dashboard() {
  const { saldoCaixa, totalEntradas, totalSaidas, entradasCaixa, isLoading } = useDashboardData();
  
  const { data: products = [] } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['dashboard-sales-month'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sales').select('*').order('sale_date', { ascending: false }).limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  // Calcular produtos mais vendidos
  const topProducts = sales.reduce((acc: any[], sale: any) => {
    const existing = acc.find(item => item.product === sale.product_name);
    if (existing) {
      existing.value += sale.total_revenue || 0;
    } else {
      acc.push({ product: sale.product_name, value: sale.total_revenue || 0 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  const { data: services = [] } = useQuery({
    queryKey: ['dashboard-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('service_date', { ascending: false }).limit(3);
      if (error) throw error;
      return data || [];
    },
  });

  const openMonitor = (type: 'production' | 'products' | 'management') => {
    const routes = {
      production: '/monitor-producao',
      products: '/monitor-produtos',
      management: '/monitor-gestao'
    };
    window.open(routes[type], '_blank', 'width=1400,height=900');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => openMonitor('products')}
          >
            <Package className="h-4 w-4" />
            Monitor Produtos
          </Button>
          <Button 
            className="gap-2 bg-purple text-purple-foreground hover:bg-purple/90"
            onClick={() => openMonitor('production')}
          >
            <ShoppingCart className="h-4 w-4" />
            Monitor Produção
          </Button>
          <Button 
            className="gap-2"
            onClick={() => openMonitor('management')}
          >
            <TrendingUp className="h-4 w-4" />
            Monitor Gestão
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo em Caixa"
          subtitle="[mês atual]"
          value={isLoading ? "Carregando..." : `R$ ${saldoCaixa.toFixed(2)}`}
          icon={Wallet}
          variant="success"
        />
        <MetricCard
          title="Entradas de Caixa"
          subtitle="[gestão manual]"
          value={isLoading ? "Carregando..." : `R$ ${entradasCaixa.toFixed(2)}`}
          icon={TrendingUp}
          variant="info"
        />
        <MetricCard
          title="Lucro Líquido"
          subtitle="[total]"
          value="R$ 2781,96"
          icon={TrendingUp}
          variant="purple"
        />
        <MetricCard
          title="Total Despesas"
          subtitle="[total]"
          value="R$ 4400,00"
          icon={TrendingDown}
          variant="destructive"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Produtos Cadastrados"
          value={products.length.toString()}
          icon={Package}
          variant="warning"
        />
      </div>

      {/* Monthly Summary */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-500 text-white border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de outubro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-90">Faturado do Mês</p>
              <p className="text-3xl font-bold">R$ 13592,41</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Despesas do Mês</p>
              <p className="text-3xl font-bold">R$ 0,00</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm opacity-90">Lucro Líquido do Mês</p>
                <p className="text-3xl font-bold">R$ 7181,96</p>
              </div>
              <Button variant="secondary" className="gap-2">
                Ver Relatório Completo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Valor",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.length > 0 ? topProducts : chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="product"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-success" />
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma venda recente</p>
              ) : (
                sales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{sale.product_name}</p>
                      <p className="text-xs text-muted-foreground">Qtd: {sale.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">R$ {sale.total_revenue?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Lucro: R$ {sale.profit?.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-purple" />
            Serviços Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum serviço recente</p>
            ) : (
              services.map((service: any) => (
                <div key={service.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="font-medium">{service.service_type}</p>
                    <p className="text-sm text-muted-foreground">Cliente: {service.customer_name}</p>
                    <p className="text-xs text-muted-foreground">Status: {service.status}</p>
                  </div>
                  <p className="font-semibold text-lg">R$ {service.total_value?.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
