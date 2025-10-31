import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Relatorios from "./pages/Relatorios";
import GestaoCaixa from "./pages/GestaoCaixa";
import Producao from "./pages/Producao";
import PedidosMarketplace from "./pages/PedidosMarketplaceNovo";
import Produtos from "./pages/Produtos";
import Servicos from "./pages/Servicos";
import Despesas from "./pages/Despesas";
import Vendas from "./pages/Vendas";
import Estoque from "./pages/Estoque";
import Fornecedores from "./pages/Fornecedores";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import NotasFiscais from "./pages/NotasFiscais";
import MaquinasVeiculos from "./pages/MaquinasVeiculos";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracoesAparencia from "./pages/ConfiguracoesAparencia";
import GerenciamentoUsuarios from "./pages/GerenciamentoUsuarios";
import Usuarios from "./pages/Usuarios";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import MonitorProducao from "./pages/MonitorProducao";
import MonitorProdutos from "./pages/MonitorProdutos";
import MonitorGestao from "./pages/MonitorGestao";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Layout><Relatorios /></Layout></ProtectedRoute>} />
      <Route path="/gestao-caixa" element={<ProtectedRoute><Layout><GestaoCaixa /></Layout></ProtectedRoute>} />
      <Route path="/producao" element={<ProtectedRoute><Layout><Producao /></Layout></ProtectedRoute>} />
      <Route path="/pedidos-marketplace" element={<ProtectedRoute><Layout><PedidosMarketplace /></Layout></ProtectedRoute>} />
      <Route path="/produtos" element={<ProtectedRoute><Layout><Produtos /></Layout></ProtectedRoute>} />
      <Route path="/servicos" element={<ProtectedRoute><Layout><Servicos /></Layout></ProtectedRoute>} />
      <Route path="/despesas" element={<ProtectedRoute><Layout><Despesas /></Layout></ProtectedRoute>} />
      <Route path="/vendas" element={<ProtectedRoute><Layout><Vendas /></Layout></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute><Layout><Estoque /></Layout></ProtectedRoute>} />
      <Route path="/fornecedores" element={<ProtectedRoute><Layout><Fornecedores /></Layout></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>} />
      <Route path="/funcionarios" element={<ProtectedRoute><Layout><Funcionarios /></Layout></ProtectedRoute>} />
      <Route path="/notas-fiscais" element={<ProtectedRoute><Layout><NotasFiscais /></Layout></ProtectedRoute>} />
      <Route path="/maquinas-veiculos" element={<ProtectedRoute><Layout><MaquinasVeiculos /></Layout></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Layout><Configuracoes /></Layout></ProtectedRoute>} />
      <Route path="/configuracoes/aparencia" element={<ProtectedRoute><Layout><ConfiguracoesAparencia /></Layout></ProtectedRoute>} />
      <Route path="/gerenciamento-usuarios" element={<ProtectedRoute><Layout><GerenciamentoUsuarios /></Layout></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute><Layout><Usuarios /></Layout></ProtectedRoute>} />
      <Route path="/monitor-producao" element={<MonitorProducao />} />
      <Route path="/monitor-produtos" element={<MonitorProdutos />} />
      <Route path="/monitor-gestao" element={<MonitorGestao />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
