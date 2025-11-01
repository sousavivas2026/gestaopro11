import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function usePermissions() {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<string>('usuario');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPermissions();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPermissions({});
        setRole('usuario');
        setLoading(false);
        return;
      }

      // Buscar permissões do user_roles
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .single();

      if (error || !roleData) {
        // Se não encontrar role, verificar se é o primeiro usuário ou admin pelo email
        // Por padrão, dar acesso total (admin) até que seja configurado
        console.log('Sem role definida, definindo como admin por padrão');
        setPermissions({});
        setRole('admin');
      } else {
        setPermissions(roleData?.permissions || {});
        setRole(roleData?.role || 'admin');
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      // Em caso de erro, dar acesso admin para não bloquear o sistema
      setPermissions({});
      setRole('admin');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (role === 'admin') return true;
    return permissions[permission] === true;
  };

  return { permissions, role, hasPermission, loading };
}
