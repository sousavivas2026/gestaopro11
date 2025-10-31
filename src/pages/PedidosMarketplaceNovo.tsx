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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, ShoppingBag, Copy, CheckCircle, Download, FileText, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PedidosMarketplace() {
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("todos");
  const [testMode, setTestMode] = useState(true);

  const { data: orders = [] } = useQuery({
    queryKey: ['marketplace-orders', selectedMarketplace],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_orders')
        .select('*')
        .order('created_date', { ascending: false });
      
      if (selectedMarketplace !== 'todos') {
        query = query.eq('integration', selectedMarketplace);
      }
      
      const { data, error } = await query;
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
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('marketplace_orders').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-orders'] });
      toast.success(`${selectedIds.length} pedido(s) removido(s)`);
      setSelectedIds([]);
    },
  });

  const handleImportFakeOrders = async () => {
    const fakeOrders = [
      {
        order_number: `FAKE-${Date.now()}-1`,
        customer_name: "Cliente Teste 1",
        integration: selectedMarketplace === 'todos' ? 'shopee' : selectedMarketplace,
        status: 'pendente',
        items: [{ product: "Produto Teste", quantity: 2 }]
      },
      {
        order_number: `FAKE-${Date.now()}-2`,
        customer_name: "Cliente Teste 2",
        integration: selectedMarketplace === 'todos' ? 'mercadolivre' : selectedMarketplace,
        status: 'pendente',
        items: [{ product: "Produto Demo", quantity: 1 }]
      }
    ];

    const { error } = await supabase.from('marketplace_orders').insert(fakeOrders);
    if (error) {
      toast.error("Erro ao importar pedidos: " + error.message);
    } else {
      toast.success("2 pedidos fake importados com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['marketplace-orders'] });
    }
  };

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

  const handleComplete = async (order: any) => {
    await updateMutation.mutateAsync({
      id: order.id,
      data: { ...order, status: 'concluido', completed_by: 'Sistema' }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o: any) => o.id));
    }
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pedidos para exportar");
      return;
    }
    const selected = orders.filter((o: any) => selectedIds.includes(o.id));
    const csv = [
      ['Número', 'Cliente', 'Marketplace', 'Status', 'Data'],
      ...selected.map((o: any) => [
        o.order_number, o.customer_name, o.integration, o.status,
        format(new Date(o.created_date), 'dd/MM/yyyy')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-marketplace-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
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
          <div className="flex gap-2">
            {testMode && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Pedidos (Teste)
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-purple-800 text-white border-purple-600">
                  <DialogHeader>
                    <DialogTitle>Importar Pedidos de Teste</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-purple-200">Importe pedidos fake para testar o sistema</p>
                    <Button onClick={handleImportFakeOrders} className="w-full bg-blue-600 hover:bg-blue-700">
                      Importar 2 Pedidos Fake
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button 
              onClick={() => { setShowForm(!showForm); setEditingOrder(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Registrar Pedido Manual
            </Button>
          </div>
        </div>

        {/* Seletor de Marketplace */}
        <Card className="bg-purple-800 border-purple-600 mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white">Filtrar por Marketplace</Label>
                <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                  <SelectTrigger className="bg-purple-900 border-purple-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">📦 Todos</SelectItem>
                    <SelectItem value="shopee">🛍️ Shopee</SelectItem>
                    <SelectItem value="mercadolivre">💛 Mercado Livre</SelectItem>
                    <SelectItem value="magazineluiza">🔵 Magazine Luiza</SelectItem>
                    <SelectItem value="americanas">🔴 Americanas</SelectItem>
                    <SelectItem value="amazon">📦 Amazon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Integração ERP</Label>
                <Select defaultValue="nenhum">
                  <SelectTrigger className="bg-purple-900 border-purple-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    <SelectItem value="bling">🔵 Bling</SelectItem>
                    <SelectItem value="tiny">🟢 Tiny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full bg-purple-900 hover:bg-purple-700 text-white border-purple-600">
                  <Download className="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2 bg-purple-900 px-4 py-2 rounded-md">
                  <Checkbox 
                    id="test-mode" 
                    checked={testMode}
                    onCheckedChange={(checked) => setTestMode(!!checked)}
                  />
                  <label htmlFor="test-mode" className="text-sm text-white cursor-pointer">
                    Modo Teste
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <Label className="text-white">Número do Pedido *</Label>
                  <Input name="order_number" defaultValue={editingOrder?.order_number || `MP${Date.now()}`} required className="bg-purple-900 border-purple-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Cliente *</Label>
                  <Input name="customer_name" defaultValue={editingOrder?.customer_name} required className="bg-purple-900 border-purple-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Integração</Label>
                  <Select name="integration" defaultValue={editingOrder?.integration || 'manual'}>
                    <SelectTrigger className="bg-purple-900 border-purple-600 text-white">
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
                  <Label className="text-white">Produto *</Label>
                  <Input name="product" defaultValue={editingOrder?.items?.[0]?.product} required className="bg-purple-900 border-purple-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Quantidade *</Label>
                  <Input type="number" name="quantity" defaultValue={editingOrder?.items?.[0]?.quantity || 1} required className="bg-purple-900 border-purple-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Status *</Label>
                  <Select name="status" defaultValue={editingOrder?.status || 'pendente'} required>
                    <SelectTrigger className="bg-purple-900 border-purple-600 text-white">
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Pedidos Cadastrados</CardTitle>
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExportSelected} className="text-white border-white hover:bg-purple-700">
                    <FileText className="h-4 w-4 mr-2" /> Relatório ({selectedIds.length})
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(selectedIds)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Remover ({selectedIds.length})
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === orders.length && orders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-white">Número</TableHead>
                <TableHead className="text-white">Cliente</TableHead>
                <TableHead className="text-white">Itens</TableHead>
                <TableHead className="text-white">Integração</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onCheckedChange={() => {
                        setSelectedIds(prev =>
                          prev.includes(order.id)
                            ? prev.filter(id => id !== order.id)
                            : [...prev, order.id]
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-white">{order.order_number}</TableCell>
                  <TableCell className="text-white">{order.customer_name}</TableCell>
                  <TableCell className="text-white">{order.items?.length || 0} item(s)</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-white border-white">{order.integration}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{order.created_date ? format(new Date(order.created_date), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {order.status !== 'concluido' && (
                        <Button size="icon" variant="outline" onClick={() => handleComplete(order)} className="text-white border-white hover:bg-purple-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="outline" onClick={() => { setEditingOrder(order); setShowForm(true); }} className="text-white border-white hover:bg-purple-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate([order.id])}>
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
