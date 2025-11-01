CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  tipo text DEFAULT 'Usuário',
  permissoes jsonb DEFAULT '{}',
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view usuarios" ON public.usuarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert usuarios" ON public.usuarios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update usuarios" ON public.usuarios FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete usuarios" ON public.usuarios FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();