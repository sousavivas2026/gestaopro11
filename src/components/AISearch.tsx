import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  route: string;
}

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const searchAll = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const queryLower = searchQuery.toLowerCase();
    const foundResults: SearchResult[] = [];

    try {
      // Buscar produtos
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${queryLower}%,sku.ilike.%${queryLower}%,category.ilike.%${queryLower}%`);
      
      products?.forEach(p => {
        foundResults.push({
          type: 'Produto',
          title: p.name,
          subtitle: `SKU: ${p.sku || 'N/A'} - Estoque: ${p.stock_quantity}`,
          route: '/produtos'
        });
      });

      // Buscar clientes
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${queryLower}%,email.ilike.%${queryLower}%,cpf_cnpj.ilike.%${queryLower}%`);
      
      customers?.forEach(c => {
        foundResults.push({
          type: 'Cliente',
          title: c.name,
          subtitle: c.email || c.phone || 'Sem contato',
          route: '/clientes'
        });
      });

      // Buscar fornecedores
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*')
        .or(`name.ilike.%${queryLower}%,email.ilike.%${queryLower}%,cnpj.ilike.%${queryLower}%`);
      
      suppliers?.forEach(s => {
        foundResults.push({
          type: 'Fornecedor',
          title: s.name,
          subtitle: s.email || s.phone || 'Sem contato',
          route: '/fornecedores'
        });
      });

      // Buscar vendas
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .or(`product_name.ilike.%${queryLower}%,customer_name.ilike.%${queryLower}%`);
      
      sales?.forEach(s => {
        foundResults.push({
          type: 'Venda',
          title: s.product_name,
          subtitle: `Cliente: ${s.customer_name || 'N/A'} - R$ ${s.total_revenue?.toFixed(2)}`,
          route: '/vendas'
        });
      });

      // Buscar despesas
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .or(`description.ilike.%${queryLower}%,category.ilike.%${queryLower}%`);
      
      expenses?.forEach(e => {
        foundResults.push({
          type: 'Despesa',
          title: e.description,
          subtitle: `${e.category} - R$ ${e.value?.toFixed(2)}`,
          route: '/despesas'
        });
      });

      // Buscar funcionários
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .or(`name.ilike.%${queryLower}%,email.ilike.%${queryLower}%,role.ilike.%${queryLower}%`);
      
      employees?.forEach(emp => {
        foundResults.push({
          type: 'Funcionário',
          title: emp.name,
          subtitle: `${emp.role || 'Sem cargo'} - ${emp.email || 'Sem email'}`,
          route: '/funcionarios'
        });
      });

      // Buscar pedidos marketplace
      const { data: orders } = await supabase
        .from('marketplace_orders')
        .select('*')
        .or(`order_number.ilike.%${queryLower}%,customer_name.ilike.%${queryLower}%`);
      
      orders?.forEach(o => {
        foundResults.push({
          type: 'Pedido',
          title: o.order_number,
          subtitle: `Cliente: ${o.customer_name} - ${o.status}`,
          route: '/pedidos-marketplace'
        });
      });

      setResults(foundResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAll(query);
  };

  const handleResultClick = (route: string) => {
    navigate(route);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full md:w-64 justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Pesquisar em tudo...
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Busca Global</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Digite para buscar em produtos, clientes, vendas..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchAll(e.target.value);
              }}
              autoFocus
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>

          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
            {isSearching && (
              <div className="text-center text-muted-foreground py-8">
                Buscando...
              </div>
            )}
            
            {!isSearching && results.length === 0 && query && (
              <div className="text-center text-muted-foreground py-8">
                Nenhum resultado encontrado
              </div>
            )}
            
            {!isSearching && results.length === 0 && !query && (
              <div className="text-center text-muted-foreground py-8">
                Digite algo para buscar
              </div>
            )}

            {results.map((result, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleResultClick(result.route)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">{result.type}</span>
                    </div>
                    <p className="font-medium mt-1">{result.title}</p>
                    <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
