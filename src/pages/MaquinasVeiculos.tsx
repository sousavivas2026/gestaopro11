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
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Settings, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MaquinasVeiculos() {
  const queryClient = useQueryClient();
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: assets = [] } = useQuery({
    queryKey: ['machines-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines_vehicles')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('machines_vehicles').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines-vehicles'] });
      toast.success("Cadastrado com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('machines_vehicles').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines-vehicles'] });
      toast.success("Atualizado com sucesso!");
      setEditingAsset(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('machines_vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines-vehicles'] });
      toast.success("Excluído com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      type: formData.get('type'),
      name: formData.get('name'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      serial_number: formData.get('serial_number'),
      purchase_date: formData.get('purchase_date') || null,
      purchase_value: Number(formData.get('purchase_value') || 0),
      status: formData.get('status'),
      location: formData.get('location'),
      last_maintenance: formData.get('last_maintenance') || null,
      next_maintenance: formData.get('next_maintenance') || null,
      notes: formData.get('notes'),
    };

    if (editingAsset) {
      updateMutation.mutate({ id: editingAsset.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (asset: any) => {
    const { id, created_date, updated_date, ...clonedData } = asset;
    await createMutation.mutateAsync(clonedData);
  };

  const statusColors = {
    ativo: 'bg-green-500',
    manutencao: 'bg-yellow-500',
    inativo: 'bg-gray-500',
    vendido: 'bg-blue-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Máquinas e Veículos
          </h1>
          <p className="text-muted-foreground">Gerencie máquinas e veículos</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingAsset(null); }}>
          Cadastrar Novo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAsset ? 'Editar' : 'Cadastrar Máquina/Veículo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select name="type" defaultValue={editingAsset?.type || 'maquina'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maquina">Máquina</SelectItem>
                      <SelectItem value="veiculo">Veículo</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nome *</Label>
                  <Input name="name" defaultValue={editingAsset?.name} required />
                </div>
                <div>
                  <Label>Marca</Label>
                  <Input name="brand" defaultValue={editingAsset?.brand} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Modelo</Label>
                  <Input name="model" defaultValue={editingAsset?.model} />
                </div>
                <div>
                  <Label>Número de Série</Label>
                  <Input name="serial_number" defaultValue={editingAsset?.serial_number} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editingAsset?.status || 'ativo'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Data de Compra</Label>
                  <Input type="date" name="purchase_date" defaultValue={editingAsset?.purchase_date} />
                </div>
                <div>
                  <Label>Valor de Compra</Label>
                  <Input type="number" step="0.01" name="purchase_value" defaultValue={editingAsset?.purchase_value || 0} />
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input name="location" defaultValue={editingAsset?.location} placeholder="Ex: Galpão A" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Última Manutenção</Label>
                  <Input type="date" name="last_maintenance" defaultValue={editingAsset?.last_maintenance} />
                </div>
                <div>
                  <Label>Próxima Manutenção</Label>
                  <Input type="date" name="next_maintenance" defaultValue={editingAsset?.next_maintenance} />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea name="notes" defaultValue={editingAsset?.notes} />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAsset(null); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Máquinas e Veículos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Manutenção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset: any) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <Badge variant="outline">{asset.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.brand && asset.model ? `${asset.brand} ${asset.model}` : (asset.brand || asset.model || '-')}</TableCell>
                  <TableCell>{asset.location || '-'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[asset.status as keyof typeof statusColors]}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{asset.next_maintenance ? format(new Date(asset.next_maintenance), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => { setEditingAsset(asset); setShowForm(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleClone(asset)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(asset.id)}>
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
