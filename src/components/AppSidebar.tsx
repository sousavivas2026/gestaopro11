import { LayoutDashboard, FileText, Wallet, Factory, ShoppingBag, Package, Wrench, Receipt, ShoppingCart, Archive, Truck, Users as UsersIcon, UserCircle, FileCheck, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Gestão de Caixa", url: "/gestao-caixa", icon: Wallet },
  { title: "Produção", url: "/producao", icon: Factory },
  { title: "Pedidos Marketplace", url: "/pedidos-marketplace", icon: ShoppingBag },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Serviços", url: "/servicos", icon: Wrench },
  { title: "Despesas", url: "/despesas", icon: Receipt },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Estoque", url: "/estoque", icon: Archive },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck },
  { title: "Clientes", url: "/clientes", icon: UsersIcon },
  { title: "Funcionários", url: "/funcionarios", icon: UserCircle },
  { title: "Notas Fiscais", url: "/notas-fiscais", icon: FileCheck },
  { title: "Máquinas e Veículos", url: "/maquinas-veiculos", icon: Settings },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            GP
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sm text-sidebar-foreground">Gestão PRO</h2>
              <p className="text-xs text-sidebar-foreground/60">by website</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Usuários">
              <NavLink 
                to="/usuarios" 
                className={({ isActive }) => 
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
              >
                <UsersIcon className="h-4 w-4" />
                <span>Usuários</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
        <SidebarMenuButton 
              tooltip="Sair"
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (!error) {
                  window.location.href = '/auth';
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
