import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, AlertTriangle, Trash2, FileText, Plus, Minus, Copy, Edit } from "lucide-react";
import { toast } from "sonner";

export default function Estoque() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products-stock'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('stock_quantity', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const lowStockProducts = products.filter((p: any) => p.stock_quantity <= p.minimum_stock);
  const totalValue = products.reduce((sum: number, p: any) => sum + (p.stock_quantity * p.cost_price), 0);

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('products').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-stock'] });
      toast.success(`${selectedIds.length} produto(s) removido(s)`);
      setSelectedIds([]);
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: async ({ id, adjustment }: { id: string; adjustment: number }) => {
      const product = products.find((p: any) => p.id === id);
      if (!product) return;
      const newQuantity = Math.max(0, product.stock_quantity + adjustment);
      const { error } = await supabase.from('products').update({ stock_quantity: newQuantity }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-stock'] });
      toast.success("Estoque atualizado");
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
      ['Produto', 'SKU', 'Categoria', 'Estoque', 'Mínimo', 'Custo', 'Valor Total', 'Localização'],
      ...selectedProducts.map((p: any) => [
        p.name, p.sku, p.category, p.stock_quantity, p.minimum_stock,
        p.cost_price, (p.stock_quantity * p.cost_price).toFixed(2), p.location || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório exportado");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      category: formData.get('category'),
      stock_quantity: Number(formData.get('stock_quantity')),
      minimum_stock: Number(formData.get('minimum_stock')),
      cost_price: Number(formData.get('cost_price')),
      unit_price: Number(formData.get('unit_price') || 0),
      location: formData.get('location'),
      description: formData.get('description'),
    };

    if (editingProduct) {
      supabase.from('products').update(data).eq('id', editingProduct.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['products-stock'] });
        toast.success("Produto atualizado");
        setShowForm(false);
        setEditingProduct(null);
      });
    } else {
      supabase.from('products').insert([data]).then(() => {
        queryClient.invalidateQueries({ queryKey: ['products-stock'] });
        toast.success("Produto cadastrado");
        setShowForm(false);
      });
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gerenciar Materiais e Insumos</h1>
            <p className="text-slate-600">Controle estoque de produtos</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingProduct(null); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Material
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500">
              <CardTitle className="text-white text-xl">{editingProduct ? 'Editar Produto' : 'Novo Material'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Material *</Label>
                  <Input name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select name="category" defaultValue={editingProduct?.category || 'Matéria Prima'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                      <SelectItem value="Acabamento">Acabamento</SelectItem>
                      <SelectItem value="Embalagem">Embalagem</SelectItem>
                      <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select name="unit" defaultValue="Unidade">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unidade">Unidade</SelectItem>
                      <SelectItem value="Metro">Metro</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Litro">Litro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" name="stock_quantity" defaultValue={editingProduct?.stock_quantity || 0} />
                </div>
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input type="number" name="minimum_stock" defaultValue={editingProduct?.minimum_stock || 0} />
                </div>
                <div>
                  <Label>Custo Unitário (R$)</Label>
                  <Input type="number" step="0.01" name="cost_price" defaultValue={editingProduct?.cost_price || 0} />
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <Input name="supplier" placeholder="Nome do fornecedor" />
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input name="location" defaultValue={editingProduct?.location} placeholder="Ex: Galpão A - Prateleira 3" />
                </div>
                <div className="md:col-span-2">
                  <Label>Observações</Label>
                  <Textarea name="description" defaultValue={editingProduct?.description} rows={2} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProduct(null); }}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {lowStockProducts.length > 0 && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Localização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{product.stock_quantity}</Badge>
                      </TableCell>
                      <TableCell>{product.minimum_stock}</TableCell>
                      <TableCell>{product.location || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Material</CardTitle>
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
                      checked={selectedIds.length === products.length && products.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Custo Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Fornecedor</TableHead>
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
                    <TableCell>{product.category || 'materia_prima'}</TableCell>
                    <TableCell>{product.stock_quantity} unidade</TableCell>
                    <TableCell>R$ {product.cost_price?.toFixed(2)}</TableCell>
                    <TableCell>R$ {(product.stock_quantity * product.cost_price).toFixed(2)}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="outline" onClick={() => {
                          const text = `${product.name}\nCategoria: ${product.category}\nEstoque: ${product.stock_quantity}\nCusto: R$ ${product.cost_price}`;
                          navigator.clipboard.writeText(text);
                          toast.success("Copiado!");
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => { setEditingProduct(product); setShowForm(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => {
                          if (confirm('Deseja remover este produto?')) {
                            supabase.from('products').delete().eq('id', product.id).then(() => {
                              queryClient.invalidateQueries({ queryKey: ['products-stock'] });
                              toast.success("Produto removido");
                            });
                          }
                        }}>
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
