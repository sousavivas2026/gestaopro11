import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function AISearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const searches = await Promise.all([
        supabase.from('products').select('*').ilike('name', `%${searchTerm}%`).limit(5),
        supabase.from('sales').select('*').ilike('product_name', `%${searchTerm}%`).limit(5),
        supabase.from('services').select('*').ilike('service_type', `%${searchTerm}%`).limit(5),
        supabase.from('customers').select('*').ilike('name', `%${searchTerm}%`).limit(5),
        supabase.from('employees').select('*').ilike('name', `%${searchTerm}%`).limit(5),
        supabase.from('suppliers').select('*').ilike('name', `%${searchTerm}%`).limit(5),
        supabase.from('marketplace_orders').select('*').ilike('order_number', `%${searchTerm}%`).limit(5),
        supabase.from('production_orders').select('*').ilike('product_name', `%${searchTerm}%`).limit(5),
      ]);

      const allResults = [
        ...searches[0].data?.map(item => ({ ...item, type: 'Produto', route: '/produtos' })) || [],
        ...searches[1].data?.map(item => ({ ...item, type: 'Venda', route: '/vendas' })) || [],
        ...searches[2].data?.map(item => ({ ...item, type: 'Serviço', route: '/servicos' })) || [],
        ...searches[3].data?.map(item => ({ ...item, type: 'Cliente', route: '/clientes' })) || [],
        ...searches[4].data?.map(item => ({ ...item, type: 'Funcionário', route: '/funcionarios' })) || [],
        ...searches[5].data?.map(item => ({ ...item, type: 'Fornecedor', route: '/fornecedores' })) || [],
        ...searches[6].data?.map(item => ({ ...item, type: 'Pedido Marketplace', route: '/pedidos-marketplace' })) || [],
        ...searches[7].data?.map(item => ({ ...item, type: 'Ordem de Produção', route: '/producao' })) || [],
      ];

      setResults(allResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: any) => {
    navigate(result.route);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-900 to-blue-700 text-white border-none">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Pesquisa Inteligente</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
          <Input
            placeholder="Buscar produtos, vendas, serviços, clientes..."
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{result.name || result.product_name || result.service_type || result.order_number}</p>
                    <p className="text-sm text-white/70">
                      {result.description || result.customer_name || result.email || ''}
                    </p>
                  </div>
                  <Badge variant="secondary">{result.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="mt-4 text-center text-white/70">
            Buscando...
          </div>
        )}

        {searchTerm.length >= 2 && results.length === 0 && !isSearching && (
          <div className="mt-4 text-center text-white/70">
            Nenhum resultado encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
