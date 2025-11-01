import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Bell, Palette, Database, Volume2, Download, Upload, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { SoundAlertSettings } from "@/components/SoundAlertSettings";

export default function Configuracoes() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Gerencie integrações, notificações e backup do sistema</p>
      </div>

      <Tabs defaultValue="integracoes" className="space-y-4">
        <TabsList className="bg-card border">
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="backup">Backup CSV</TabsTrigger>
          <TabsTrigger value="servidor">Servidor</TabsTrigger>
        </TabsList>

        <TabsContent value="integracoes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Bling */}
            <Card className="border-2 border-blue-500">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle>Integração Bling</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>Client ID</Label>
                  <Input placeholder="Client ID" />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input type="password" placeholder="Client Secret" />
                </div>
                <Button className="w-full">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* Tiny */}
            <Card className="border-2 border-green-500">
              <CardHeader className="bg-green-600 text-white">
                <CardTitle>Integração Tiny</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>Client ID</Label>
                  <Input placeholder="Client ID" />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input type="password" placeholder="Client Secret" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* Shopee */}
            <Card className="border-2 border-orange-500">
              <CardHeader className="bg-orange-600 text-white">
                <CardTitle>Integração Shopee</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>Client ID</Label>
                  <Input placeholder="Client ID" />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input type="password" placeholder="Client Secret" />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* Mercado Livre */}
            <Card className="border-2 border-yellow-500">
              <CardHeader className="bg-yellow-600 text-white">
                <CardTitle>Integração Mercado Livre</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>Client ID</Label>
                  <Input placeholder="Client ID" />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input type="password" placeholder="Client Secret" />
                </div>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* AliExpress Seller */}
            <Card className="border-2 border-red-500">
              <CardHeader className="bg-red-600 text-white">
                <CardTitle>Integração AliExpress Seller</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>App Key</Label>
                  <Input placeholder="App Key" />
                </div>
                <div>
                  <Label>App Secret</Label>
                  <Input type="password" placeholder="App Secret" />
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* TikTok Seller */}
            <Card className="border-2 border-gray-800">
              <CardHeader className="bg-gray-900 text-white">
                <CardTitle>Integração TikTok Seller</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>App Key</Label>
                  <Input placeholder="App Key" />
                </div>
                <div>
                  <Label>App Secret</Label>
                  <Input type="password" placeholder="App Secret" />
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* Shein */}
            <Card className="border-2 border-pink-500">
              <CardHeader className="bg-pink-600 text-white">
                <CardTitle>Integração Shein</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Tipo de Autenticação</Label>
                  <Input defaultValue="OAuth 2.0" disabled />
                </div>
                <div>
                  <Label>App ID</Label>
                  <Input placeholder="App ID" />
                </div>
                <div>
                  <Label>App Secret</Label>
                  <Input type="password" placeholder="App Secret" />
                </div>
                <Button className="w-full bg-pink-600 hover:bg-pink-700">
                  Autenticar via OAuth 2.0
                </Button>
                <Button variant="ghost" className="w-full text-xs">
                  Importar Pedidos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <SoundAlertSettings />
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personalização da Interface
              </CardTitle>
              <CardDescription>Personalize cores, fontes e visual do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <CardContent className="p-6 flex flex-col items-center gap-3">
                    <Sun className="h-12 w-12 text-yellow-500" />
                    <div className="text-center">
                      <p className="font-semibold">Modo Claro</p>
                      <p className="text-xs text-muted-foreground">Interface clara e brilhante</p>
                    </div>
                    {theme === 'light' && (
                      <div className="text-xs text-primary font-semibold">✓ Ativo</div>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <CardContent className="p-6 flex flex-col items-center gap-3">
                    <Moon className="h-12 w-12 text-blue-500" />
                    <div className="text-center">
                      <p className="font-semibold">Modo Escuro</p>
                      <p className="text-xs text-muted-foreground">Interface escura e confortável</p>
                    </div>
                    {theme === 'dark' && (
                      <div className="text-xs text-primary font-semibold">✓ Ativo</div>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <CardContent className="p-6 flex flex-col items-center gap-3">
                    <Monitor className="h-12 w-12 text-purple-500" />
                    <div className="text-center">
                      <p className="font-semibold">Sistema</p>
                      <p className="text-xs text-muted-foreground">Seguir configuração do sistema</p>
                    </div>
                    {theme === 'system' && (
                      <div className="text-xs text-primary font-semibold">✓ Ativo</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => window.location.href = '/configuracoes/aparencia'}
                  className="w-full"
                  size="lg"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Personalizar Cores e Fontes
                </Button>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Customize as cores RGB, fontes e estilos do sistema
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm">
                  💡 <strong>Dica:</strong> O tema {theme === 'dark' ? 'escuro está ativo' : theme === 'light' ? 'claro está ativo' : 'está seguindo seu sistema operacional'}.
                  {theme === 'dark' ? ' Cores mais suaves para trabalhar à noite.' : theme === 'light' ? ' Interface brilhante para o dia.' : ' Muda automaticamente conforme o horário.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Exporte todos os dados do sistema em formato CSV/Excel compatível com MySQL e outros bancos de dados.</p>
                <div className="bg-white text-gray-900 p-4 rounded-lg space-y-2">
                  <p className="font-semibold">Dados incluídos:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Produtos e variações</li>
                    <li>Vendas e serviços</li>
                    <li>Clientes e fornecedores</li>
                    <li>Despesas e caixa</li>
                    <li>Materiais e estoque</li>
                    <li>Funcionários e ativos</li>
                    <li>Produção e pedidos marketplace</li>
                  </ul>
                  <p className="text-xs text-orange-600">⚠️ Formato CSV/Excel compatível com MySQL, PostgreSQL e outros bancos</p>
                </div>
                <Button className="w-full bg-white text-orange-600 hover:bg-gray-100" onClick={() => {
                  // Implementar exportação CSV
                  import('@/lib/supabase').then(async ({ supabase }) => {
                    const tables = ['products', 'customers', 'suppliers', 'employees', 'materials', 'sales', 'services', 'expenses', 'marketplace_orders', 'production_orders', 'invoices', 'machines_vehicles', 'usuarios'];
                    for (const table of tables) {
                      const { data } = await supabase.from(table).select('*');
                      if (!data || data.length === 0) continue;
                      const headers = Object.keys(data[0]);
                      const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `backup-${table}-${new Date().toISOString().slice(0,10)}.csv`;
                      a.click();
                    }
                  });
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Depositar Backup CSV/Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-teal-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Restaure todos os dados do sistema a partir de um arquivo de backup CSV/Excel.</p>
                <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                  <p className="font-semibold">⚠️ Atenção!</p>
                  <p className="text-sm">A importação irá <strong>adicionar aos dados atuais</strong> do sistema. Confirme-se de ter um backup antes de prosseguir.</p>
                </div>
                <div>
                  <Label className="text-white">Selecionar Arquivo de Backup (.csv)</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    className="bg-white/10 border-white/20 text-white file:bg-white file:text-green-600"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const lines = text.split('\n');
                      const headers = lines[0].split(',');
                      const rows = lines.slice(1).map(line => {
                        const values = line.split(',');
                        return headers.reduce((obj, h, i) => ({ ...obj, [h]: JSON.parse(values[i] || 'null') }), {});
                      });
                      const tableName = file.name.match(/backup-(.+)-\d{4}/)?.[1] || 'unknown';
                      const { supabase } = await import('@/lib/supabase');
                      await supabase.from(tableName).insert(rows);
                      alert(`${rows.length} registros importados!`);
                    }}
                  />
                  <p className="text-xs mt-1">Procurar... Nenhum arquivo selecionado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="servidor">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Servidor</CardTitle>
              <CardDescription>Configurações avançadas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em construção...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
