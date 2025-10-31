import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

export default function Estoque() {
  const { data: products = [] } = useQuery({
    queryKey: ['products-stock'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('stock_quantity', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const lowStockProducts = products.filter((p: any) => p.stock_quantity <= p.minimum_stock);
  const totalValue = products.reduce((sum: number, p: any) => sum + (p.stock_quantity * p.cost_price), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Controle de Estoque</h1>
          <p className="text-slate-600">Visão geral do seu inventário</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {lowStockProducts.length > 0 && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Localização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{product.stock_quantity}</Badge>
                      </TableCell>
                      <TableCell>{product.minimum_stock}</TableCell>
                      <TableCell>{product.location || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Inventário Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Custo Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Localização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock_quantity <= product.minimum_stock ? "destructive" : "default"}>
                        {product.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.minimum_stock}</TableCell>
                    <TableCell>R$ {product.cost_price?.toFixed(2)}</TableCell>
                    <TableCell>R$ {(product.stock_quantity * product.cost_price).toFixed(2)}</TableCell>
                    <TableCell>{product.location || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
