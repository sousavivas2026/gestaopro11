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
import { Trash2, Edit, Wrench, Copy, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";

export default function Servicos() {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('service_date', { ascending: false });
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
      const { error } = await supabase.from('services').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Serviço cadastrado com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('services').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Serviço atualizado com sucesso!");
      setEditingService(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Serviço excluído com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const total_value = Number(formData.get('total_value'));
    const cost = Number(formData.get('cost') || 0);
    const profit = total_value - cost;

    const data = {
      service_type: formData.get('service_type'),
      customer_name: formData.get('customer_name'),
      customer_id: formData.get('customer_id') || null,
      employee_name: formData.get('employee_name'),
      employee_id: formData.get('employee_id') || null,
      total_value,
      cost,
      profit,
      service_date: formData.get('service_date'),
      status: formData.get('status'),
      payment_method: formData.get('payment_method'),
      description: formData.get('description'),
      notes: formData.get('notes'),
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (service: any) => {
    const { id, created_date, updated_date, ...clonedData } = service;
    await createMutation.mutateAsync(clonedData);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === services.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services.map((s: any) => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione serviços para exportar");
      return;
    }
    const selectedServices = services.filter((s: any) => selectedIds.includes(s.id));
    const csv = [
      ['Data', 'Tipo', 'Cliente', 'Funcionário', 'Valor', 'Status'],
      ...selectedServices.map((s: any) => [
        s.service_date, s.service_type, s.customer_name, s.employee_name || '', s.total_value, s.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servicos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('services').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(`${selectedIds.length} serviço(s) removido(s)`);
      setSelectedIds([]);
    },
  });

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja remover ${selectedIds.length} serviço(s)?`)) return;
    deleteMultipleMutation.mutate(selectedIds);
  };

  const statusColors = {
    pendente: 'bg-yellow-500',
    'em-andamento': 'bg-blue-500',
    concluido: 'bg-green-500',
    cancelado: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            Serviços
          </h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingService(null); }}>
          Novo Serviço
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de Serviço *</Label>
                  <Input name="service_type" defaultValue={editingService?.service_type} required />
                </div>
                <div>
                  <Label>Cliente *</Label>
                  <Select name="customer_id" defaultValue={editingService?.customer_id || ''}>
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
                <div>
                  <Label>Nome do Cliente *</Label>
                  <Input name="customer_name" defaultValue={editingService?.customer_name} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Funcionário</Label>
                  <Select name="employee_id" defaultValue={editingService?.employee_id || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor Total *</Label>
                  <Input type="number" step="0.01" name="total_value" defaultValue={editingService?.total_value} required />
                </div>
                <div>
                  <Label>Custo</Label>
                  <Input type="number" step="0.01" name="cost" defaultValue={editingService?.cost || 0} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Data do Serviço *</Label>
                  <Input type="date" name="service_date" defaultValue={editingService?.service_date || new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select name="status" defaultValue={editingService?.status || 'pendente'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em-andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Método de Pagamento</Label>
                  <Select name="payment_method" defaultValue={editingService?.payment_method || ''}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Descrição</Label>
                  <Textarea name="description" defaultValue={editingService?.description} />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea name="notes" defaultValue={editingService?.notes} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingService(null); }}>
                  Cancelar
                </Button>
                <CopyButton 
                  textToCopy={`Tipo Serviço: \nCliente: \nFuncionário: \nValor: R$ 0,00\nData: ${new Date().toLocaleDateString()}`}
                  label="Copiar Modelo"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Serviços Cadastrados</CardTitle>
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
                    checked={selectedIds.length === services.length && services.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service: any) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(service.id)}
                      onCheckedChange={() => handleSelectOne(service.id)}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(service.service_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{service.service_type}</TableCell>
                  <TableCell>{service.customer_name}</TableCell>
                  <TableCell>{service.employee_name || '-'}</TableCell>
                  <TableCell>R$ {service.total_value?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[service.status as keyof typeof statusColors]}>
                      {service.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => { setEditingService(service); setShowForm(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleClone(service)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(service.id)}>
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
