import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Relatorios() {
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = mês atual
  const currentDate = subMonths(new Date(), selectedMonth);

  const { data: sales = [] } = useQuery({
    queryKey: ['sales-report', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', format(startOfMonth(currentDate), 'yyyy-MM-dd'))
        .lte('sale_date', format(endOfMonth(currentDate), 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-report', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', format(startOfMonth(currentDate), 'yyyy-MM-dd'))
        .lte('expense_date', format(endOfMonth(currentDate), 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-report'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-report'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const totalReceita = sales.reduce((sum: number, s: any) => sum + (s.total_revenue || 0), 0);
  const totalDespesas = expenses.reduce((sum: number, e: any) => sum + (e.value || 0), 0);
  const totalLucro = sales.reduce((sum: number, s: any) => sum + (s.profit || 0), 0);
  const lucroLiquido = totalReceita - totalDespesas;

  const topProducts = sales.reduce((acc: any, sale: any) => {
    const productName = sale.product_name;
    if (!acc[productName]) {
      acc[productName] = { name: productName, quantity: 0, revenue: 0 };
    }
    acc[productName].quantity += sale.quantity;
    acc[productName].revenue += sale.total_revenue;
    return acc;
  }, {});

  const topProductsList = Object.values(topProducts)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  const categoryExpenses = expenses.reduce((acc: any, expense: any) => {
    const category = expense.category || 'Outros';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.value;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Relatórios Mensais
          </h1>
          <p className="text-muted-foreground">Análise detalhada do desempenho do seu negócio</p>
        </div>
        <div className="w-48">
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Mês Atual</SelectItem>
              <SelectItem value="1">Mês Anterior</SelectItem>
              <SelectItem value="2">2 Meses Atrás</SelectItem>
              <SelectItem value="3">3 Meses Atrás</SelectItem>
              <SelectItem value="6">6 Meses Atrás</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Período: {format(startOfMonth(currentDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(endOfMonth(currentDate), 'dd/MM/yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalReceita.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{sales.length} vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {totalLucro.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Margem de vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {lucroLiquido.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {lucroLiquido >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top 5 Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsList.length > 0 ? (
                topProductsList.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} unidades</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R$ {product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum produto vendido neste período</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(categoryExpenses).length > 0 ? (
                Object.entries(categoryExpenses)
                  .sort((a: any, b: any) => b[1] - a[1])
                  .map(([category, value]: any) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <p className="font-medium">{category}</p>
                      <p className="font-bold text-red-600">R$ {value.toFixed(2)}</p>
                    </div>
                  ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma despesa neste período</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {sales.length > 0 ? (totalReceita / sales.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.print()}>
              Imprimir Relatório
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
