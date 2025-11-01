import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, Copy } from "lucide-react";
import { format } from "date-fns";
import { CopyButton } from "@/components/CopyButton";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function GestaoCaixa() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);

  // Buscar movimentações de caixa
  const { data: cashMovements = [] } = useQuery({
    queryKey: ['cash-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('category', 'Movimentação Caixa')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Calcular totais
  const totalEntradas = cashMovements
    .filter((m: any) => m.description?.startsWith('Entrada'))
    .reduce((sum: number, m: any) => sum + (m.value || 0), 0);
  
  const totalSaidas = cashMovements
    .filter((m: any) => m.description?.startsWith('Saída'))
    .reduce((sum: number, m: any) => sum + (m.value || 0), 0);
  
  const saldo = totalEntradas - totalSaidas;

  // Mutation para criar movimentação
  const createMovement = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('expenses').insert([{
        category: 'Movimentação Caixa',
        description: data.type === 'entrada' ? `Entrada: ${data.description}` : `Saída: ${data.description}`,
        value: parseFloat(data.value),
        expense_date: data.date,
        payment_method: data.payment_method,
        notes: data.notes
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      toast.success("Movimentação registrada!");
      setShowForm(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') || 'entrada';
    const category = formData.get('category') || 'Outros';
    const description = formData.get('description') || '';
    
    createMovement.mutate({
      type,
      description: `${description}`,
      value: formData.get('value'),
      date: new Date().toISOString().split('T')[0],
      payment_method: formData.get('payment_method'),
      notes: `Categoria: ${category}`
    });
  };

  const handleCloneSelected = () => {
    const movementsToClone = cashMovements.filter((m: any) => selectedMovements.includes(m.id));
    
    if (movementsToClone.length === 0) {
      toast.error("Selecione pelo menos uma movimentação para clonar");
      return;
    }

    movementsToClone.forEach((movement: any) => {
      createMovement.mutate({
        type: movement.description?.startsWith('Entrada') ? 'entrada' : 'saida',
        description: movement.description?.replace('Entrada: ', '').replace('Saída: ', ''),
        value: movement.value,
        date: new Date().toISOString().split('T')[0],
        payment_method: movement.payment_method,
        notes: movement.notes
      });
    });

    setSelectedMovements([]);
    toast.success(`${movementsToClone.length} movimentação(ões) clonada(s)!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            Gestão de Caixa
          </h1>
          <p className="text-muted-foreground">Controle completo de entradas e saídas - Dados salvos permanentemente</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalEntradas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{cashMovements.filter((m: any) => m.description?.startsWith('Entrada')).length} transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalSaidas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{cashMovements.filter((m: any) => m.description?.startsWith('Saída')).length} transações</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldo.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {saldo >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registrar Movimentação</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  const btn = document.getElementById('entrada-btn');
                  if (btn) btn.click();
                }}
              >
                <TrendingUp className="h-4 w-4" />
                Entrada
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  const btn = document.getElementById('saida-btn');
                  if (btn) btn.click();
                }}
              >
                <TrendingDown className="h-4 w-4" />
                Saída
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id="cash-form" className="space-y-4">
              <input type="hidden" name="type" id="movement-type" value="entrada" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Valor *</Label>
                  <Input id="value" name="value" type="number" step="0.01" placeholder="0,00" required />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <select name="category" id="category" className="w-full p-2 border rounded" required>
                    <option value="Outros">Outros</option>
                    <option value="Retirada">Retirada</option>
                    <option value="Deposito">Depósito</option>
                    <option value="Pagamento">Pagamento</option>
                    <option value="Recebimento">Recebimento</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" placeholder="Detalhes da movimentação..." />
              </div>
              
              <div>
                <Label htmlFor="payment_method">Método de Pagamento</Label>
                <select name="payment_method" id="payment_method" className="w-full p-2 border rounded">
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" id="entrada-btn" className="hidden" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('movement-type')?.setAttribute('value', 'entrada');
                  const form = document.getElementById('cash-form') as HTMLFormElement;
                  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }}>Entrada</Button>
                <Button type="submit" id="saida-btn" className="hidden" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('movement-type')?.setAttribute('value', 'saida');
                  const form = document.getElementById('cash-form') as HTMLFormElement;
                  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }}>Saída</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <CopyButton 
                  textToCopy={`Tipo: Entrada/Saída\nValor: R$ 0,00\nCategoria: Outros\nDescrição: `}
                  label="Copiar Modelo"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimento do Caixa</CardTitle>
          <div className="flex gap-2">
            {selectedMovements.length > 0 && (
              <Button onClick={handleCloneSelected} size="sm" className="gap-2">
                <Copy className="h-4 w-4" />
                Clonar ({selectedMovements.length})
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMovements.length === cashMovements.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMovements(cashMovements.map((m: any) => m.id));
                      } else {
                        setSelectedMovements([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashMovements.map((movement: any) => {
                const isEntrada = movement.description?.startsWith('Entrada');
                return (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMovements.includes(movement.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMovements([...selectedMovements, movement.id]);
                          } else {
                            setSelectedMovements(selectedMovements.filter(id => id !== movement.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(movement.expense_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={isEntrada ? 'default' : 'destructive'}>
                        {isEntrada ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {isEntrada ? 'entrada' : 'saída'}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.description?.replace('Entrada: ', '').replace('Saída: ', '')}</TableCell>
                    <TableCell className={isEntrada ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {isEntrada ? '+' : '-'} R$ {movement.value?.toFixed(2)}
                    </TableCell>
                    <TableCell>{movement.payment_method || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ações Rápidas</CardTitle>
          <CopyButton 
            textToCopy={`Saldo: R$ ${saldo.toFixed(2)}\nEntradas: R$ ${totalEntradas.toFixed(2)}\nSaídas: R$ ${totalSaidas.toFixed(2)}`}
            label="Copiar Resumo"
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20" onClick={() => window.location.href = '/vendas'}>
              Registrar Venda
            </Button>
            <Button variant="outline" className="h-20" onClick={() => window.location.href = '/despesas'}>
              Registrar Despesa
            </Button>
            <Button variant="outline" className="h-20" onClick={() => window.location.href = '/relatorios'}>
              Ver Relatórios
            </Button>
            <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard'}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
