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
import { Trash2, Edit, Package, Copy, Plus, FileDown } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";

export default function Produtos() {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*, suppliers(name)').order('created_date', { ascending: false });
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
      const { error } = await supabase.from('products').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto cadastrado com sucesso!");
      setShowForm(false);
      setEditingProduct(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('products').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto atualizado com sucesso!");
      setEditingProduct(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto excluído com sucesso!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      description: formData.get('description'),
      category: formData.get('category'),
      unit_price: parseFloat(formData.get('unit_price') as string) || 0,
      cost_price: parseFloat(formData.get('cost_price') as string) || 0,
      stock_quantity: parseInt(formData.get('stock_quantity') as string) || 0,
      minimum_stock: parseInt(formData.get('minimum_stock') as string) || 0,
      location: formData.get('location'),
      supplier_id: formData.get('supplier_id') || null,
      active: true,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClone = async (product: any) => {
    const { id, created_date, updated_date, ...clonedData } = product;
    await createMutation.mutateAsync({
      ...clonedData,
      name: `${clonedData.name} (Cópia)`,
    });
  };

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('products').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`${selectedIds.length} produto(s) removido(s)`);
      setSelectedIds([]);
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p: any) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja remover ${selectedIds.length} produto(s)?`)) return;
    deleteMultipleMutation.mutate(selectedIds);
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione produtos para exportar");
      return;
    }
    const selectedProducts = products.filter((p: any) => selectedIds.includes(p.id));
    const csv = [
      ['Nome', 'SKU', 'Categoria', 'Estoque', 'Preço Venda', 'Preço Custo'],
      ...selectedProducts.map((p: any) => [
        p.name, p.sku || '', p.category || '', p.stock_quantity, p.unit_price, p.cost_price
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const lowStockProducts = products.filter((p: any) => p.stock_quantity <= p.minimum_stock);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Produtos</h1>
          <p className="text-slate-600">Gerencie seu catálogo de produtos</p>
        </div>

        {lowStockProducts.length > 0 && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">
                  {lowStockProducts.length} produto(s) com estoque baixo
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end mb-6">
          <Button onClick={() => { setShowForm(true); setEditingProduct(null); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" defaultValue={editingProduct?.sku} />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" defaultValue={editingProduct?.category} />
                </div>
                <div>
                  <Label htmlFor="supplier_id">Fornecedor</Label>
                  <Select name="supplier_id" defaultValue={editingProduct?.supplier_id || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {suppliers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit_price">Preço de Venda *</Label>
                  <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={editingProduct?.unit_price} required />
                </div>
                <div>
                  <Label htmlFor="cost_price">Preço de Custo *</Label>
                  <Input id="cost_price" name="cost_price" type="number" step="0.01" defaultValue={editingProduct?.cost_price} required />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Qtd. em Estoque *</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={editingProduct?.stock_quantity} required />
                </div>
                <div>
                  <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
                  <Input id="minimum_stock" name="minimum_stock" type="number" defaultValue={editingProduct?.minimum_stock} />
                </div>
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input id="location" name="location" defaultValue={editingProduct?.location} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" defaultValue={editingProduct?.description} rows={3} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">{editingProduct ? 'Atualizar' : 'Cadastrar'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProduct(null); }}>Cancelar</Button>
                  <CopyButton 
                    textToCopy={`Nome: \nSKU: \nCategoria: \nPreço Venda: R$ 0,00\nPreço Custo: R$ 0,00\nEstoque: 0`}
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
              <CardTitle>Lista de Produtos</CardTitle>
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExportSelected}>
                    <FileDown className="h-4 w-4 mr-2" /> Exportar ({selectedIds.length})
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
                      checked={selectedIds.length === products.length && products.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={() => handleSelectOne(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock_quantity <= product.minimum_stock ? "destructive" : "default"}>
                        {product.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {product.unit_price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingProduct(product); setShowForm(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleClone(product)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(product.id)}>
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
