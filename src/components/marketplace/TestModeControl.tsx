import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

export function TestModeControl() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem('marketplace_mode') || 'teste';
    setIsProduction(mode === 'producao');
  }, []);

  const handleToggle = (checked: boolean) => {
    const newMode = checked ? 'producao' : 'teste';
    localStorage.setItem('marketplace_mode', newMode);
    setIsProduction(checked);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Modo de Operação</span>
          <Badge variant={isProduction ? "default" : "secondary"} className="text-sm">
            {isProduction ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> PRODUÇÃO</>
            ) : (
              <><AlertCircle className="w-3 h-3 mr-1" /> TESTE</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="mode-switch" className="text-slate-200">
            Ativar Modo Produção
          </Label>
          <Switch
            id="mode-switch"
            checked={isProduction}
            onCheckedChange={handleToggle}
          />
        </div>
        
        <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300">
          {isProduction ? (
            <div className="space-y-2">
              <p className="font-semibold text-green-400">✓ Modo Produção Ativo</p>
              <p>Pedidos reais serão importados das integrações configuradas.</p>
              <p className="text-yellow-400">Configure suas credenciais de API nas Configurações.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-blue-400">ℹ Modo Teste Ativo</p>
              <p>Use o botão "Importar Pedidos" para gerar pedidos falsos e testar o sistema.</p>
              <p>Nenhuma integração real será utilizada.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
