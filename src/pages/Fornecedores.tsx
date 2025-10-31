import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Truck, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";

export default function Fornecedores() {
  const queryClient = useQueryClient();
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

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
      const { error } = await supabase.from('suppliers').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success("Fornecedor cadastrado com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('suppliers').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success("Fornecedor atualizado com sucesso!");
      setEditingSupplier(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success("Fornecedor excluído com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      contact_person: formData.get('contact_person'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      cnpj: formData.get('cnpj'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip_code: formData.get('zip_code'),
      notes: formData.get('notes'),
    };

    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (supplier: any) => {
    const { id, created_date, updated_date, ...clonedData } = supplier;
    await createMutation.mutateAsync({
      ...clonedData,
      name: `${clonedData.name} (Cópia)`,
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Fornecedores</h1>
          <p className="text-slate-600">Gerencie seus parceiros e fornecedores</p>
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={() => { setShowForm(true); setEditingSupplier(null); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Fornecedor
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" name="name" defaultValue={editingSupplier?.name} required />
                </div>
                <div>
                  <Label htmlFor="contact_person">Pessoa de Contato</Label>
                  <Input id="contact_person" name="contact_person" defaultValue={editingSupplier?.contact_person} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingSupplier?.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" defaultValue={editingSupplier?.phone} />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" name="cnpj" defaultValue={editingSupplier?.cnpj} />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" name="address" defaultValue={editingSupplier?.address} />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" name="city" defaultValue={editingSupplier?.city} />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" name="state" defaultValue={editingSupplier?.state} />
                </div>
                <div>
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input id="zip_code" name="zip_code" defaultValue={editingSupplier?.zip_code} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" name="notes" defaultValue={editingSupplier?.notes} rows={3} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">{editingSupplier ? 'Atualizar' : 'Cadastrar'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSupplier(null); }}>Cancelar</Button>
                  <CopyButton 
                    textToCopy={`Nome: \nContato: \nEmail: \nTelefone: \nCNPJ: \nEndereço: `}
                    label="Copiar Modelo"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier: any) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.city}, {supplier.state}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingSupplier(supplier); setShowForm(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleClone(supplier)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(supplier.id)}>
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
