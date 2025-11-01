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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Receipt, Copy, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CopyButton } from "@/components/CopyButton";

export default function Despesas() {
  const queryClient = useQueryClient();
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*, suppliers(name)').order('expense_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('expenses').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Despesa cadastrada com sucesso!");
      setShowForm(false);
      setEditingExpense(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('expenses').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Despesa atualizada com sucesso!");
      setEditingExpense(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Despesa excluída com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      description: formData.get('description'),
      category: formData.get('category'),
      value: parseFloat(formData.get('value') as string),
      expense_date: formData.get('expense_date'),
      payment_method: formData.get('payment_method'),
      supplier_id: formData.get('supplier_id') || null,
      supplier_name: formData.get('supplier_name'),
      due_date: formData.get('due_date') || null,
      paid: formData.get('paid') === 'on',
      notes: formData.get('notes'),
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.value || 0), 0);
  const paidExpenses = expenses.filter((e: any) => e.paid).reduce((sum: number, e: any) => sum + (e.value || 0), 0);
  const pendingExpenses = totalExpenses - paidExpenses;

  const handleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e: any) => e.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione despesas para exportar");
      return;
    }
    const selectedExpenses = expenses.filter((e: any) => selectedIds.includes(e.id));
    const csv = [
      ['Descrição', 'Categoria', 'Valor', 'Data', 'Vencimento', 'Status'],
      ...selectedExpenses.map((e: any) => [
        e.description, e.category, e.value, e.expense_date, e.due_date || '', e.paid ? 'Paga' : 'Pendente'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `despesas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('expenses').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(`${selectedIds.length} despesa(s) removida(s)`);
      setSelectedIds([]);
    },
  });

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja remover ${selectedIds.length} despesa(s)?`)) return;
    deleteMultipleMutation.mutate(selectedIds);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Despesas</h1>
          <p className="text-slate-600">Controle suas despesas e contas a pagar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {paidExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {pendingExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={() => { setShowForm(true); setEditingExpense(null); }} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Despesa
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input id="description" name="description" defaultValue={editingExpense?.description} required />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select name="category" defaultValue={editingExpense?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Energia">Energia</SelectItem>
                      <SelectItem value="Água">Água</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Impostos">Impostos</SelectItem>
                      <SelectItem value="Matéria-Prima">Matéria-Prima</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Outras">Outras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Valor *</Label>
                  <Input id="value" name="value" type="number" step="0.01" defaultValue={editingExpense?.value} required />
                </div>
                <div>
                  <Label htmlFor="expense_date">Data da Despesa *</Label>
                  <Input id="expense_date" name="expense_date" type="date" defaultValue={editingExpense?.expense_date} required />
                </div>
                <div>
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input id="due_date" name="due_date" type="date" defaultValue={editingExpense?.due_date} />
                </div>
                <div>
                  <Label htmlFor="payment_method">Forma de Pagamento</Label>
                  <Select name="payment_method" defaultValue={editingExpense?.payment_method}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier_name">Fornecedor/Beneficiário</Label>
                  <Input id="supplier_name" name="supplier_name" defaultValue={editingExpense?.supplier_name} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" name="notes" defaultValue={editingExpense?.notes} rows={2} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="paid" name="paid" defaultChecked={editingExpense?.paid} />
                  <Label htmlFor="paid">Despesa paga</Label>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">{editingExpense ? 'Atualizar' : 'Cadastrar'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingExpense(null); }}>Cancelar</Button>
                  <CopyButton 
                    textToCopy={`Descrição: \nCategoria: \nValor: R$ 0,00\nData: ${new Date().toLocaleDateString()}\nFornecedor: `}
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
              <CardTitle>Lista de Despesas</CardTitle>
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
                      checked={selectedIds.length === expenses.length && expenses.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(expense.id)}
                        onCheckedChange={() => handleSelectOne(expense.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>R$ {expense.value?.toFixed(2)}</TableCell>
                    <TableCell>{expense.expense_date ? format(new Date(expense.expense_date), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>{expense.due_date ? format(new Date(expense.due_date), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={expense.paid ? "default" : "destructive"}>
                        {expense.paid ? 'Paga' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingExpense(expense); setShowForm(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(expense.id)}>
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
