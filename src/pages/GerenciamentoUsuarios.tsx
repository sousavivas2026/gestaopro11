import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Trash2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  permissoes: Record<string, boolean>;
  ativo: boolean;
  created_at: string;
}

const permissoesList = [
  { id: "dashboard", label: "Dashboard" },
  { id: "relatorios", label: "Relatórios" },
  { id: "servicos", label: "Serviços" },
  { id: "pedidos_marketplace", label: "Pedidos Marketplace" },
  { id: "faturas", label: "Faturas" },
  { id: "produtos", label: "Produtos" },
  { id: "clientes", label: "Clientes" },
  { id: "despesas", label: "Despesas" },
  { id: "fornecedores", label: "Fornecedores" },
  { id: "alvos", label: "Alvos" },
  { id: "vendas", label: "Vendas" },
  { id: "materiais", label: "Materiais" },
  { id: "producao", label: "Produção" },
  { id: "funcionarios", label: "Funcionários" },
];

export default function GerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("Usuário");
  const [permissoes, setPermissoes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    carregarUsuarios();
    
    // Realtime subscription
    const channel = supabase
      .channel('usuarios-changes-' + Date.now())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'usuarios',
      }, () => {
        console.log('Mudança detectada - recarregando usuários');
        carregarUsuarios();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarUsuario = async () => {
    if (!nome || !email || !senha) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Validar senha
    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // Primeiro, criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            tipo
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (authError) {
        // Tratar erros específicos
        if (authError.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado no sistema');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário no sistema de autenticação');
      }
      
      // Depois, criar entrada na tabela usuarios (o trigger criará em user_roles automaticamente)
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([{
          nome,
          email,
          tipo,
          permissoes,
          ativo: true
        }]);
      
      if (userError) {
        // Se falhar ao criar na tabela usuarios, tentar deletar o usuário auth
        await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error);
        throw new Error('Erro ao salvar dados do usuário: ' + userError.message);
      }
      
      toast.success("Usuário criado com sucesso! Login disponível imediatamente.");
      setShowDialog(false);
      resetForm();
      await carregarUsuarios();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverUsuario = async (id: string) => {
    if (!confirm("Deseja realmente remover este usuário?")) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Usuário removido com sucesso!");
      carregarUsuarios();
    } catch (error: any) {
      toast.error("Erro ao remover usuário: " + error.message);
    }
  };

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setTipo("Usuário");
    setPermissoes({});
  };

  const handlePermissaoChange = (permId: string, checked: boolean) => {
    setPermissoes(prev => ({ ...prev, [permId]: checked }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500'];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-slate-600">Controle de acesso e permissões</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Senha *</Label>
                    <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite a senha" />
                  </div>
                  <div>
                    <Label>Tipo de Usuário *</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Usuário">Usuário</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-3 block">Permissões de Acesso</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {permissoesList.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={permissoes[perm.id] || false}
                          onCheckedChange={(checked) => handlePermissaoChange(perm.id, !!checked)}
                        />
                        <label
                          htmlFor={perm.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAdicionarUsuario} className="flex-1">
                    Adicionar Usuário
                  </Button>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : usuarios.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">Nenhum usuário cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((usuario, index) => (
              <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg`}>
                        {getInitials(usuario.nome)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                        <p className="text-sm text-slate-500">{usuario.email}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={usuario.tipo === 'Administrador' ? 'default' : 'secondary'}>
                      <Shield className="w-3 h-3 mr-1" />
                      {usuario.tipo}
                    </Badge>
                    <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-xs text-slate-500 mb-2">Permissões:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(usuario.permissoes || {})
                        .filter(([_, has]) => has)
                        .slice(0, 3)
                        .map(([key]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {permissoesList.find(p => p.id === key)?.label || key}
                          </Badge>
                        ))}
                      {Object.values(usuario.permissoes || {}).filter(Boolean).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.values(usuario.permissoes || {}).filter(Boolean).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        // TODO: Implementar diálogo de alterar senha
                        toast.info("Funcionalidade em desenvolvimento");
                      }}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleRemoverUsuario(usuario.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
