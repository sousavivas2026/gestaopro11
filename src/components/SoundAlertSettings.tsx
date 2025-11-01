import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { SoundAlertAudioManager } from './SoundAlertAudioManager';

const SOUND_OPTIONS = [
  { value: 'novo_pedido', label: 'Novo Pedido' },
  { value: 'pedido_concluido', label: 'Pedido Concluído' },
  { value: 'atencao_maquina', label: 'Atenção Máquina' },
  { value: 'compareca_direcao', label: 'Compareça à Direção' },
  { value: 'estoque_baixo', label: 'Estoque Baixo' },
];

const SOUND_CONTEXTS = [
  { key: 'marketplace_new', label: 'Novo pedido marketplace' },
  { key: 'marketplace_complete', label: 'Pedido marketplace concluído' },
  { key: 'monitor_external', label: 'Monitor externo' },
  { key: 'stock_alert', label: 'Alerta de estoque' },
];

export function SoundAlertSettings() {
  const { alertMode, audioSource, setAlertMode, setAudioSource, testSound, selectedSounds, setSelectedSound } = useSoundAlert();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Alertas Sonoros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Fonte do áudio</Label>
            <RadioGroup value={audioSource} onValueChange={(v) => setAudioSource(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="server" id="server" />
                <Label htmlFor="server">Servidor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="local" />
                <Label htmlFor="local">Local</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Modo de alerta</Label>
            <RadioGroup value={alertMode} onValueChange={(v) => setAlertMode(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="disabled" id="disabled" />
                <Label htmlFor="disabled" className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4" /> Desativado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on-order" id="on-order" />
                <Label htmlFor="on-order" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> Ao chegar pedido
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interval" id="interval" />
                <Label htmlFor="interval" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> A cada intervalo
                </Label>
              </div>
            </RadioGroup>
          </div>

          {audioSource === 'server' && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-semibold">Selecionar Sons para Cada Contexto</Label>
              {SOUND_CONTEXTS.map((context) => (
                <div key={context.key} className="space-y-2">
                  <Label htmlFor={context.key}>{context.label}</Label>
                  <Select
                    value={selectedSounds[context.key] || 'novo_pedido'}
                    onValueChange={(value) => setSelectedSound(context.key, value as any)}
                  >
                    <SelectTrigger id={context.key}>
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
              ))}
            </div>
          )}

          <Button onClick={testSound} variant="outline" className="w-full">
            <Volume2 className="w-4 h-4 mr-2" />
            Testar Som
          </Button>
        </CardContent>
      </Card>

      <SoundAlertAudioManager />
    </div>
  );
}
