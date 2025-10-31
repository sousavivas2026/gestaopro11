import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CopyButton({ textToCopy, label = "Copiar", variant = "outline", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleCopy} className="gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {size !== "icon" && (copied ? "Copiado!" : label)}
    </Button>
  );
}
