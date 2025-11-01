import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Factory, Copy, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Producao() {
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: orders = [] } = useQuery({
    queryKey: ['production-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_date', { ascending: false });
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

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*').eq('active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('production_orders').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem de produção criada!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('production_orders').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem atualizada com sucesso!");
      setEditingOrder(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('production_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem excluída com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      order_number: formData.get('order_number'),
      product_name: formData.get('product_name'),
      product_id: formData.get('product_id') || null,
      quantity: Number(formData.get('quantity')),
      employee_name: formData.get('employee_name'),
      employee_id: formData.get('employee_id') || null,
      status: formData.get('status'),
      priority: formData.get('priority'),
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
      notes: formData.get('notes'),
    };

    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (order: any) => {
    const { id, created_date, updated_date, ...clonedData} = order;
    await createMutation.mutateAsync(clonedData);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o: any) => o.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione ordens para exportar");
      return;
    }
    const selectedOrders = orders.filter((o: any) => selectedIds.includes(o.id));
    const csv = [
      ['Número', 'Produto', 'Quantidade', 'Status', 'Prioridade', 'Funcionário'],
      ...selectedOrders.map((o: any) => [
        o.order_number, o.product_name, o.quantity, o.status, o.priority, o.employee_name || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `producao-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('production_orders').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success(`${selectedIds.length} ordem(ns) removida(s)`);
      setSelectedIds([]);
    },
  });

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja remover ${selectedIds.length} ordem(ns)?`)) return;
    deleteMultipleMutation.mutate(selectedIds);
  };

  const statusColors = {
    pendente: 'bg-yellow-500',
    'em-producao': 'bg-blue-500',
    concluido: 'bg-green-500',
    cancelado: 'bg-red-500',
  };

  const priorityColors = {
    baixa: 'bg-gray-500',
    normal: 'bg-blue-500',
    alta: 'bg-orange-500',
    urgente: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="h-8 w-8 text-primary" />
            Ordens de Produção
          </h1>
          <p className="text-muted-foreground">Planeje e controle a produção da sua fábrica</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingOrder(null); }}>
          Nova Ordem
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingOrder ? 'Editar Ordem' : 'Nova Ordem de Produção'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Número da Ordem *</Label>
                  <Input name="order_number" defaultValue={editingOrder?.order_number || `OP${Date.now()}`} required />
                </div>
                <div>
                  <Label>Produto *</Label>
                  <Select name="product_id" defaultValue={editingOrder?.product_id || ''}>
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
                  <Input name="product_name" defaultValue={editingOrder?.product_name} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Quantidade *</Label>
                  <Input type="number" name="quantity" defaultValue={editingOrder?.quantity || 1} required />
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select name="status" defaultValue={editingOrder?.status || 'pendente'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em-producao">Em Produção</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select name="priority" defaultValue={editingOrder?.priority || 'normal'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Funcionário</Label>
                  <Select name="employee_id" defaultValue={editingOrder?.employee_id || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <Input type="datetime-local" name="start_date" defaultValue={editingOrder?.start_date} />
                </div>
                <div>
                  <Label>Data de Conclusão</Label>
                  <Input type="datetime-local" name="end_date" defaultValue={editingOrder?.end_date} />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea name="notes" defaultValue={editingOrder?.notes} />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingOrder(null); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ordens de Produção</CardTitle>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportSelected}>
                  <FileText className="h-4 w-4 mr-2" /> Relatório ({selectedIds.length})
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
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
                <TableHead>Número</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onCheckedChange={() => handleSelectOne(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[order.priority as keyof typeof priorityColors]}>
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.employee_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
  );
}
