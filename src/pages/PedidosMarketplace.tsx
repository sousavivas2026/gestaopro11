import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, ShoppingBag, Copy, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PedidosMarketplace() {
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ['marketplace-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*')
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('marketplace_orders').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-orders'] });
      toast.success("Pedido cadastrado com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('marketplace_orders').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-orders'] });
      toast.success("Pedido atualizado com sucesso!");
      setEditingOrder(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('marketplace_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-orders'] });
      toast.success("Pedido excluído com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      order_number: formData.get('order_number'),
      customer_name: formData.get('customer_name'),
      integration: formData.get('integration'),
      status: formData.get('status'),
      completed_by: formData.get('completed_by'),
      items: [{ product: formData.get('product'), quantity: Number(formData.get('quantity')) }],
    };

    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (order: any) => {
    const { id, created_date, updated_date, ...clonedData } = order;
    await createMutation.mutateAsync(clonedData);
  };

  const handleComplete = async (order: any) => {
    await updateMutation.mutateAsync({
      id: order.id,
      data: { ...order, status: 'concluido', completed_by: 'Sistema' }
    });
  };

  const statusColors = {
    pendente: 'bg-yellow-500',
    separando: 'bg-blue-500',
    concluido: 'bg-green-500',
  };

  const pendingCount = orders.filter((o: any) => o.status === 'pendente').length;
  const completedCount = orders.filter((o: any) => o.status === 'concluido').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 text-white">
              <ShoppingBag className="h-10 w-10" />
              PEDIDOS MARKETPLACE
            </h1>
            <p className="text-purple-200 mt-2">Gerencie pedidos de múltiplas plataformas</p>
          </div>
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingOrder(null); }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Registrar Pedido Manual
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-purple-800 border-purple-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{orders.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-800 border-yellow-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-200">Pedidos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-800 border-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Pedidos Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{completedCount}</div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-purple-800 border-purple-600 mb-6">
            <CardHeader>
              <CardTitle className="text-white">{editingOrder ? 'Editar Pedido' : 'Novo Pedido'}</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Número do Pedido *</Label>
                  <Input name="order_number" defaultValue={editingOrder?.order_number || `MP${Date.now()}`} required />
                </div>
                <div>
                  <Label>Cliente *</Label>
                  <Input name="customer_name" defaultValue={editingOrder?.customer_name} required />
                </div>
                <div>
                  <Label>Integração</Label>
                  <Select name="integration" defaultValue={editingOrder?.integration || 'manual'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="magazineluiza">Magazine Luiza</SelectItem>
                      <SelectItem value="americanas">Americanas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Produto *</Label>
                  <Input name="product" defaultValue={editingOrder?.items?.[0]?.product} required />
                </div>
                <div>
                  <Label>Quantidade *</Label>
                  <Input type="number" name="quantity" defaultValue={editingOrder?.items?.[0]?.quantity || 1} required />
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select name="status" defaultValue={editingOrder?.status || 'pendente'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="separando">Separando</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingOrder(null); }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-purple-800 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white">Pedidos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Integração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.items?.length || 0} item(s)</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.integration}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.created_date ? format(new Date(order.created_date), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {order.status !== 'concluido' && (
                        <Button size="icon" variant="outline" onClick={() => handleComplete(order)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="outline" onClick={() => { setEditingOrder(order); setShowForm(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleClone(order)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(order.id)}>
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
    </div>
  );
}
