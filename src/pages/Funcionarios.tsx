import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, UserCircle, Copy, Plus, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { CopyButton } from "@/components/CopyButton";

export default function Funcionarios() {
  const queryClient = useQueryClient();
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('employees').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Funcionário cadastrado com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('employees').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Funcionário atualizado com sucesso!");
      setEditingEmployee(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Funcionário excluído com sucesso!");
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e: any) => e.id));
    }
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione funcionários para exportar");
      return;
    }
    const selected = employees.filter((e: any) => selectedIds.includes(e.id));
    const csv = [
      ['Nome', 'Cargo', 'Email', 'Telefone', 'Salário'],
      ...selected.map((e: any) => [e.name, e.role, e.email, e.phone, e.salary])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funcionarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      role: formData.get('role'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      cpf: formData.get('cpf'),
      hire_date: formData.get('hire_date') || null,
      salary: parseFloat(formData.get('salary') as string) || null,
      birth_date: formData.get('birth_date') || null,
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip_code: formData.get('zip_code'),
      active: true,
    };

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Funcionários</h1>
          <p className="text-slate-600">Gerencie sua equipe</p>
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={() => { setShowForm(true); setEditingEmployee(null); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Funcionário
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" name="name" defaultValue={editingEmployee?.name} required />
                </div>
                <div>
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" name="role" defaultValue={editingEmployee?.role} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingEmployee?.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" defaultValue={editingEmployee?.phone} />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" name="cpf" defaultValue={editingEmployee?.cpf} />
                </div>
                <div>
                  <Label htmlFor="hire_date">Data de Contratação</Label>
                  <Input id="hire_date" name="hire_date" type="date" defaultValue={editingEmployee?.hire_date} />
                </div>
                <div>
                  <Label htmlFor="salary">Salário</Label>
                  <Input id="salary" name="salary" type="number" step="0.01" defaultValue={editingEmployee?.salary} />
                </div>
                <div>
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input id="birth_date" name="birth_date" type="date" defaultValue={editingEmployee?.birth_date} />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" name="address" defaultValue={editingEmployee?.address} />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" name="city" defaultValue={editingEmployee?.city} />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" name="state" defaultValue={editingEmployee?.state} />
                </div>
                <div>
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input id="zip_code" name="zip_code" defaultValue={editingEmployee?.zip_code} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">{editingEmployee ? 'Atualizar' : 'Cadastrar'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingEmployee(null); }}>Cancelar</Button>
                  <CopyButton 
                    textToCopy={`Nome: \nCargo: \nEmail: \nTelefone: \nCPF: \nSalário: R$ 0,00`}
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
              <CardTitle>Lista de Funcionários</CardTitle>
              {selectedIds.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleExportSelected}>
                  <FileText className="h-4 w-4 mr-2" /> Relatório ({selectedIds.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === employees.length && employees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee: any) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(employee.id)}
                        onCheckedChange={() => {
                          setSelectedIds(prev =>
                            prev.includes(employee.id)
                              ? prev.filter(id => id !== employee.id)
                              : [...prev, employee.id]
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.salary ? `R$ ${employee.salary.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={employee.active ? "default" : "secondary"}>
                        {employee.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingEmployee(employee); setShowForm(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(employee.id)}>
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
