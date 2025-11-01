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

      if (error) {
        console.error('Erro ao carregar permissões:', error);
        setPermissions({});
        setRole('usuario');
      } else {
        setPermissions(roleData?.permissions || {});
        setRole(roleData?.role || 'usuario');
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissions({});
      setRole('usuario');
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
