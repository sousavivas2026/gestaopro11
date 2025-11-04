
-- Criar trigger para sincronizar tabela usuarios com user_roles
CREATE OR REPLACE TRIGGER sync_usuarios_to_user_roles
  AFTER INSERT OR UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();
  
-- Comentário: Este trigger garante que toda vez que um usuário é criado ou atualizado
-- na tabela usuarios, uma entrada correspondente é criada/atualizada em user_roles
