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
import { Trash2, Edit, FileCheck, Copy, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";

export default function NotasFiscais() {
  const queryClient = useQueryClient();
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*');
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
      const { error } = await supabase.from('invoices').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Nota fiscal cadastrada com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('invoices').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Nota fiscal atualizada com sucesso!");
      setEditingInvoice(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Nota fiscal excluída com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      type: formData.get('type'),
      invoice_number: formData.get('invoice_number'),
      supplier_name: formData.get('supplier_name'),
      supplier_id: formData.get('supplier_id') || null,
      customer_name: formData.get('customer_name'),
      customer_id: formData.get('customer_id') || null,
      total_value: Number(formData.get('total_value')),
      tax_value: Number(formData.get('tax_value') || 0),
      issue_date: formData.get('issue_date'),
      due_date: formData.get('due_date') || null,
      status: formData.get('status'),
      payment_method: formData.get('payment_method'),
      notes: formData.get('notes'),
    };

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (invoice: any) => {
    const { id, created_date, updated_date, ...clonedData } = invoice;
    await createMutation.mutateAsync(clonedData);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map((i: any) => i.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione notas para exportar");
      return;
    }
    const selectedInvoices = invoices.filter((i: any) => selectedIds.includes(i.id));
    const csv = [
      ['Número', 'Tipo', 'Fornecedor/Cliente', 'Valor', 'Data Emissão', 'Status'],
      ...selectedInvoices.map((i: any) => [
        i.invoice_number, i.type, i.supplier_name || i.customer_name || '', i.total_value, i.issue_date, i.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-fiscais-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('invoices').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(`${selectedIds.length} nota(s) removida(s)`);
      setSelectedIds([]);
    },
  });

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja remover ${selectedIds.length} nota(s)?`)) return;
    deleteMultipleMutation.mutate(selectedIds);
  };

  const statusColors = {
    emitida: 'bg-blue-500',
    paga: 'bg-green-500',
    cancelada: 'bg-red-500',
    vencida: 'bg-orange-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-primary" />
            Notas Fiscais
          </h1>
          <p className="text-muted-foreground">Gerencie suas notas fiscais</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingInvoice(null); }}>
          Nova Nota Fiscal
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingInvoice ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select name="type" defaultValue={editingInvoice?.type || 'entrada'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Número da NF *</Label>
                  <Input name="invoice_number" defaultValue={editingInvoice?.invoice_number} required />
                </div>
                <div>
                  <Label>Data de Emissão *</Label>
                  <Input type="date" name="issue_date" defaultValue={editingInvoice?.issue_date || new Date().toISOString().split('T')[0]} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fornecedor (Entrada)</Label>
                  <Select name="supplier_id" defaultValue={editingInvoice?.supplier_id || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cliente (Saída)</Label>
                  <Select name="customer_id" defaultValue={editingInvoice?.customer_id || ''}>
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
                  <Label>Valor Total *</Label>
                  <Input type="number" step="0.01" name="total_value" defaultValue={editingInvoice?.total_value} required />
                </div>
                <div>
                  <Label>Valor dos Impostos</Label>
                  <Input type="number" step="0.01" name="tax_value" defaultValue={editingInvoice?.tax_value || 0} />
                </div>
                <div>
                  <Label>Vencimento</Label>
                  <Input type="date" name="due_date" defaultValue={editingInvoice?.due_date} />
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select name="status" defaultValue={editingInvoice?.status || 'emitida'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emitida">Emitida</SelectItem>
                      <SelectItem value="paga">Paga</SelectItem>
                      <SelectItem value="vencida">Vencida</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Método de Pagamento</Label>
                  <Select name="payment_method" defaultValue={editingInvoice?.payment_method || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea name="notes" defaultValue={editingInvoice?.notes} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingInvoice(null); }}>
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
            <CardTitle>Notas Fiscais Cadastradas</CardTitle>
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
                    checked={selectedIds.length === invoices.length && invoices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fornecedor/Cliente</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(invoice.id)}
                      onCheckedChange={() => handleSelectOne(invoice.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.type === 'entrada' ? 'default' : 'secondary'}>
                      {invoice.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.supplier_name || invoice.customer_name || '-'}</TableCell>
                  <TableCell>R$ {invoice.total_value?.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(invoice.issue_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleClone(invoice)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(invoice.id)}>
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
