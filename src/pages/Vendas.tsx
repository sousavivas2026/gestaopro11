import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, ShoppingCart, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";

export default function Vendas() {
  const queryClient = useQueryClient();
  const [editingSale, setEditingSale] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('sales').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success("Venda cadastrada com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('sales').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success("Venda atualizada com sucesso!");
      setEditingSale(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success("Venda excluída com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const unit_price = Number(formData.get('unit_price'));
    const cost_price = Number(formData.get('cost_price') || 0);
    const total_revenue = quantity * unit_price;
    const total_cost = quantity * cost_price;
    const profit = total_revenue - total_cost;

    const data = {
      product_name: formData.get('product_name'),
      product_id: formData.get('product_id') || null,
      customer_name: formData.get('customer_name'),
      customer_id: formData.get('customer_id') || null,
      quantity,
      unit_price,
      cost_price,
      total_revenue,
      total_cost,
      profit,
      sale_date: formData.get('sale_date'),
      payment_method: formData.get('payment_method'),
      notes: formData.get('notes'),
    };

    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (sale: any) => {
    const { id, created_date, updated_date, ...clonedData } = sale;
    await createMutation.mutateAsync(clonedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Vendas
          </h1>
          <p className="text-muted-foreground">Gerencie suas vendas</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingSale(null); }}>
          Nova Venda
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSale ? 'Editar Venda' : 'Nova Venda'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Produto *</Label>
                  <Select name="product_id" defaultValue={editingSale?.product_id || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nome do Produto *</Label>
                  <Input name="product_name" defaultValue={editingSale?.product_name} required />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select name="customer_id" defaultValue={editingSale?.customer_id || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Quantidade *</Label>
                  <Input type="number" name="quantity" defaultValue={editingSale?.quantity || 1} required />
                </div>
                <div>
                  <Label>Preço Unitário *</Label>
                  <Input type="number" step="0.01" name="unit_price" defaultValue={editingSale?.unit_price} required />
                </div>
                <div>
                  <Label>Custo Unitário</Label>
                  <Input type="number" step="0.01" name="cost_price" defaultValue={editingSale?.cost_price || 0} />
                </div>
                <div>
                  <Label>Data da Venda *</Label>
                  <Input type="date" name="sale_date" defaultValue={editingSale?.sale_date || new Date().toISOString().split('T')[0]} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Método de Pagamento</Label>
                  <Select name="payment_method" defaultValue={editingSale?.payment_method || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea name="notes" defaultValue={editingSale?.notes} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSale(null); }}>
                  Cancelar
                </Button>
                <CopyButton 
                  textToCopy={`Produto: \nCliente: \nQuantidade: 1\nPreço: R$ 0,00\nData: ${new Date().toLocaleDateString()}`}
                  label="Copiar Modelo"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vendas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.sale_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{sale.product_name}</TableCell>
                  <TableCell>{sale.customer_name || '-'}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>R$ {sale.total_revenue?.toFixed(2)}</TableCell>
                  <TableCell className={sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    R$ {sale.profit?.toFixed(2)}
                  </TableCell>
                  <TableCell>{sale.payment_method || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => { setEditingSale(sale); setShowForm(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleClone(sale)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(sale.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
