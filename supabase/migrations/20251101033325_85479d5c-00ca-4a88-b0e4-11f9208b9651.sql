-- Criar user_roles table separada para segurança
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'usuario');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'usuario',
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para checar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função security definer para checar permissões
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND (permissions->>_permission)::boolean = true
  )
$$;

-- RLS policies para user_roles
CREATE POLICY "Usuários podem ver seu próprio role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem gerenciar roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar user_role automaticamente ao criar usuário na tabela usuarios
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar role quando usuário é criado/atualizado
  INSERT INTO public.user_roles (user_id, role, permissions)
  VALUES (
    (SELECT id FROM auth.users WHERE email = NEW.email LIMIT 1),
    CASE 
      WHEN NEW.tipo = 'Administrador' THEN 'admin'::app_role
      WHEN NEW.tipo = 'Gerente' THEN 'gerente'::app_role
      ELSE 'usuario'::app_role
    END,
    NEW.permissoes
  )
  ON CONFLICT (user_id) DO UPDATE
  SET role = CASE 
      WHEN NEW.tipo = 'Administrador' THEN 'admin'::app_role
      WHEN NEW.tipo = 'Gerente' THEN 'gerente'::app_role
      ELSE 'usuario'::app_role
    END,
    permissions = NEW.permissoes;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_user_role_trigger
AFTER INSERT OR UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();