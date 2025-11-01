import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MonitorAudioControlsProps {
  context: string;
}

const SOUND_OPTIONS = [
  { value: 'novo_pedido', label: 'Novo Pedido' },
  { value: 'pedido_concluido', label: 'Pedido Concluído' },
  { value: 'atencao_maquina', label: 'Atenção Máquina' },
  { value: 'compareca_direcao', label: 'Compareça à Direção' },
  { value: 'estoque_baixo', label: 'Estoque Baixo' },
];

export function MonitorAudioControls({ context }: MonitorAudioControlsProps) {
  const { alertMode, setAlertMode, selectedSounds, setSelectedSound, testSound } = useSoundAlert();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full w-14 h-14 shadow-lg"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings className="h-6 w-6" />
      </Button>

      {showSettings && (
        <Card className="w-80 bg-slate-900/95 backdrop-blur border-slate-700 shadow-2xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Controles de Áudio</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Modo de Alerta</Label>
              <div className="flex gap-2">
                <Button
                  variant={alertMode === 'disabled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlertMode('disabled')}
                  className="flex-1"
                >
                  <VolumeX className="h-4 w-4 mr-1" />
                  Off
                </Button>
                <Button
                  variant={alertMode === 'on-order' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlertMode('on-order')}
                  className="flex-1"
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  Ao Pedido
                </Button>
                <Button
                  variant={alertMode === 'interval' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlertMode('interval')}
                  className="flex-1"
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  Intervalo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Som para este Monitor</Label>
              <Select
                value={selectedSounds[context] || 'novo_pedido'}
                onValueChange={(value) => setSelectedSound(context, value as any)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOUND_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={testSound} variant="outline" className="w-full">
              <Volume2 className="w-4 h-4 mr-2" />
              Testar Som
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
