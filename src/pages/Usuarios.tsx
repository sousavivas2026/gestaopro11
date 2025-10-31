import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users2, UserPlus, Trash2, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const permissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "produtos", label: "Produtos" },
  { id: "vendas", label: "Vendas" },
  { id: "relatorios", label: "Relatórios" },
  { id: "clientes", label: "Clientes" },
  { id: "materiais", label: "Materiais" },
  { id: "servicos", label: "Serviços" },
  { id: "despesas", label: "Despesas" },
  { id: "producao", label: "Produção" },
  { id: "marketplace", label: "Pedidos Marketplace" },
  { id: "fornecedores", label: "Fornecedores" },
  { id: "funcionarios", label: "Funcionários" },
  { id: "faturas", label: "Faturas" },
  { id: "alvos", label: "Alvos" },
];

export default function Usuarios() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("usuario");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleCreateUser = async () => {
    if (!username || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome de usuário e senha",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${username}@gestaopro.local`,
        password: password,
        options: {
          data: {
            username: username,
            user_type: userType,
            permissions: selectedPermissions,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Usuário criado!",
        description: `Usuário ${username} foi criado com sucesso`,
      });

      setUsername("");
      setPassword("");
      setSelectedPermissions([]);
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users2 className="h-8 w-8 text-primary" />
            Gerenciamento de Usuários
          </h1>
        </div>
        <Button variant="outline" className="gap-2">
          <Key className="h-4 w-4" />
          Alterar Minha Senha
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div>
              <Label>Nome de Usuário</Label>
              <Input 
                placeholder="Nome de usuário" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input 
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 block">Permissões de Acesso</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPermissions([...selectedPermissions, permission.id]);
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={permission.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button className="gap-2" onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <p className="font-semibold">admin</p>
                <Badge variant="default">Administrador</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                S
              </div>
              <div>
                <p className="font-semibold">salvador</p>
                <Badge variant="default">Administrador</Badge>
              </div>
            </div>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
