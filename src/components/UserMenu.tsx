import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

const routePermissionMap: Record<string, string> = {
  "/": "dashboard",
  "/relatorios": "relatorios",
  "/gestao-caixa": "gestao_caixa",
  "/producao": "producao",
  "/pedidos-marketplace": "pedidos_marketplace",
  "/produtos": "produtos",
  "/servicos": "servicos",
  "/despesas": "despesas",
  "/vendas": "vendas",
  "/estoque": "materiais",
  "/fornecedores": "fornecedores",
  "/clientes": "clientes",
  "/funcionarios": "funcionarios",
  "/notas-fiscais": "faturas",
  "/maquinas-veiculos": "alvos",
};

export function useRoutePermission() {
  const { hasPermission, role, loading } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const currentPath = window.location.pathname;
    const requiredPermission = routePermissionMap[currentPath];

    // Admin tem acesso a tudo
    if (role === 'admin') return;

    // Verificar se tem permissão para a rota atual
    if (requiredPermission && !hasPermission(requiredPermission)) {
      console.log(`Sem permissão para: ${currentPath}`);
      navigate("/", { replace: true });
    }
  }, [hasPermission, role, loading, navigate]);

  return { hasPermission, role, loading };
}
