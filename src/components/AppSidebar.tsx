import { LayoutDashboard, FileText, Wallet, Factory, ShoppingBag, Package, Wrench, Receipt, ShoppingCart, Archive, Truck, Users as UsersIcon, UserCircle, FileCheck, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: "dashboard" },
  { title: "Relatórios", url: "/relatorios", icon: FileText, permission: "relatorios" },
  { title: "Gestão de Caixa", url: "/gestao-caixa", icon: Wallet, permission: "gestao_caixa" },
  { title: "Produção", url: "/producao", icon: Factory, permission: "producao" },
  { title: "Pedidos Marketplace", url: "/pedidos-marketplace", icon: ShoppingBag, permission: "pedidos_marketplace" },
  { title: "Produtos", url: "/produtos", icon: Package, permission: "produtos" },
  { title: "Serviços", url: "/servicos", icon: Wrench, permission: "servicos" },
  { title: "Despesas", url: "/despesas", icon: Receipt, permission: "despesas" },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart, permission: "vendas" },
  { title: "Estoque", url: "/estoque", icon: Archive, permission: "materiais" },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck, permission: "fornecedores" },
  { title: "Clientes", url: "/clientes", icon: UsersIcon, permission: "clientes" },
  { title: "Funcionários", url: "/funcionarios", icon: UserCircle, permission: "funcionarios" },
  { title: "Notas Fiscais", url: "/notas-fiscais", icon: FileCheck, permission: "faturas" },
  { title: "Máquinas e Veículos", url: "/maquinas-veiculos", icon: Settings, permission: "alvos" },
  { title: "Configurações", url: "/configuracoes", icon: Settings, permission: "dashboard" },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { hasPermission, role, loading } = usePermissions();
  const collapsed = state === "collapsed";

  // Filtrar itens do menu baseado nas permissões do usuário
  const visibleMenuItems = menuItems.filter(item => {
    if (role === 'admin') return true;
    return hasPermission(item.permission);
  });

  // Verificar se usuário tem acesso à página de usuários
  const canAccessUserManagement = role === 'admin';

  if (loading) {
    return (
      <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar w-[180px]">
        <div className="p-4 text-center text-muted-foreground">Carregando...</div>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar touch-pan-y overscroll-contain w-[180px] shadow-[0_0_20px_rgba(16,185,129,0.3)]" style={{ WebkitOverflowScrolling: 'touch' }}>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
              GP
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-xs text-sidebar-foreground">Gestão PRO</h2>
                <p className="text-[10px] text-muted-foreground">by website</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="h-6 w-6 rounded hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-0.5 bg-sidebar-foreground rounded"></div>
              <div className="w-3 h-0.5 bg-sidebar-foreground rounded"></div>
              <div className="w-3 h-0.5 bg-sidebar-foreground rounded"></div>
            </div>
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="touch-manipulation active:scale-95 min-h-[36px] text-xs">
                     <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      }
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="border-t border-sidebar-border p-2 mt-auto">
        <SidebarMenu>
          {canAccessUserManagement && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Gerenciar Usuários" className="min-h-[36px]">
                <NavLink 
                  to="/gerenciamento-usuarios" 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md font-medium" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  }
                >
                  <UsersIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">Usuários</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair do Sistema"
              className="min-h-[36px] text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (!error) {
                  window.location.href = '/auth';
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
