import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, Type, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesAparencia() {
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#10b981");
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [textColor, setTextColor] = useState("#1e293b");
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");

  useEffect(() => {
    // Carregar configurações salvas
    const saved = localStorage.getItem("theme_customization");
    if (saved) {
      const config = JSON.parse(saved);
      setPrimaryColor(config.primaryColor || "#3b82f6");
      setSecondaryColor(config.secondaryColor || "#10b981");
      setBackgroundColor(config.backgroundColor || "#f8fafc");
      setTextColor(config.textColor || "#1e293b");
      setFontFamily(config.fontFamily || "Inter, sans-serif");
      applyTheme(config);
    }
  }, []);

  const applyTheme = (config: any) => {
    const root = document.documentElement;
    
    // Converter hex para HSL
    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return "0 0% 50%";
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Aplicar em todos os elementos
    root.style.setProperty('--primary', hexToHSL(config.primaryColor));
    root.style.setProperty('--secondary', hexToHSL(config.secondaryColor));
    root.style.setProperty('--background', hexToHSL(config.backgroundColor));
    root.style.setProperty('--foreground', hexToHSL(config.textColor));
    root.style.setProperty('--font-family', config.fontFamily);
    
    document.body.style.fontFamily = config.fontFamily;
    document.body.style.backgroundColor = config.backgroundColor;
    document.body.style.color = config.textColor;
    
    // Criar estilos globais forçados
    let styleSheet = document.getElementById('custom-theme-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'custom-theme-styles';
      document.head.appendChild(styleSheet);
    }
    
    styleSheet.textContent = `
      :root {
        --primary: ${hexToHSL(config.primaryColor)} !important;
        --secondary: ${hexToHSL(config.secondaryColor)} !important;
        --background: ${hexToHSL(config.backgroundColor)} !important;
        --foreground: ${hexToHSL(config.textColor)} !important;
      }
      body {
        font-family: ${config.fontFamily} !important;
        background-color: ${config.backgroundColor} !important;
        color: ${config.textColor} !important;
      }
    `;
  };

  const handleSave = () => {
    const config = {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily
    };
    
    localStorage.setItem("theme_customization", JSON.stringify(config));
    applyTheme(config);
    toast.success("Configurações de aparência salvas!");
  };

  const handleReset = () => {
    const defaultConfig = {
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
      fontFamily: "Inter, sans-serif"
    };
    
    setPrimaryColor(defaultConfig.primaryColor);
    setSecondaryColor(defaultConfig.secondaryColor);
    setBackgroundColor(defaultConfig.backgroundColor);
    setTextColor(defaultConfig.textColor);
    setFontFamily(defaultConfig.fontFamily);
    
    localStorage.removeItem("theme_customization");
    applyTheme(defaultConfig);
    toast.success("Configurações resetadas para o padrão!");
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            Personalização da Aparência
          </h1>
          <p className="text-slate-600">Customize as cores e fontes do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Cores do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Cor Primária</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cor principal dos botões e destaques</p>
              </div>

              <div className="space-y-3">
                <Label>Cor Secundária</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cor para elementos secundários</p>
              </div>

              <div className="space-y-3">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#f8fafc"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cor de fundo principal do site</p>
              </div>

              <div className="space-y-3">
                <Label>Cor do Texto</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#1e293b"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cor principal do texto</p>
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <Label className="mb-3 block">Prévia das Cores</Label>
              <div className="grid grid-cols-4 gap-4">
                <div 
                  className="h-20 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primária
                </div>
                <div 
                  className="h-20 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Secundária
                </div>
                <div 
                  className="h-20 rounded-lg shadow-md flex items-center justify-center font-semibold border-2"
                  style={{ backgroundColor: backgroundColor, color: textColor }}
                >
                  Fundo
                </div>
                <div 
                  className="h-20 rounded-lg shadow-md flex items-center justify-center font-semibold"
                  style={{ backgroundColor: textColor, color: backgroundColor }}
                >
                  Texto
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Tipografia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Família de Fonte</Label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Inter, sans-serif">Inter (Padrão)</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Open Sans, sans-serif">Open Sans</option>
                <option value="Lato, sans-serif">Lato</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
              </select>
              <p className="text-xs text-muted-foreground">Fonte usada em todo o sistema</p>
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">Prévia da Fonte</Label>
              <div 
                className="p-6 border rounded-lg bg-white"
                style={{ fontFamily: fontFamily }}
              >
                <h2 className="text-2xl font-bold mb-2">Exemplo de Título</h2>
                <p className="text-base mb-2">Este é um exemplo de parágrafo normal com a fonte selecionada.</p>
                <p className="text-sm text-muted-foreground">Texto pequeno para referência de tamanho.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} size="lg" className="flex-1">
            Salvar Configurações
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Resetar Padrões
          </Button>
        </div>
      </div>
    </div>
  );
}
