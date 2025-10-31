import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Play, Trash2, Volume2 } from 'lucide-react';
import { saveFileLocally, listLocalFiles, deleteLocalFile, getStorageUsage } from '@/utils/localFileStorage';
import { toast } from 'sonner';
import { useSoundAlert } from '@/contexts/SoundAlertContext';

export function SoundAlertAudioManager() {
  const [uploading, setUploading] = useState(false);
  const [audioName, setAudioName] = useState('');
  const { playManualAudio } = useSoundAlert();
  const [refresh, setRefresh] = useState(0);

  const audioFiles = listLocalFiles('audio/');
  const storageUsage = getStorageUsage();

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Por favor, selecione um arquivo de áudio válido');
      return;
    }

    if (!audioName.trim()) {
      toast.error('Por favor, dê um nome ao áudio');
      return;
    }

    setUploading(true);
    try {
      const customId = `audio_${audioName.trim().replace(/\s+/g, '_')}`;
      const storedFile = await saveFileLocally(file, customId);
      
      const audioKey = `manual_audio_${audioName.trim()}`;
      localStorage.setItem(audioKey, storedFile.data);
      
      toast.success(`Áudio "${audioName}" salvo com sucesso!`);
      setAudioName('');
      setRefresh(prev => prev + 1);
      
      e.target.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar áudio');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAudio = (name: string) => {
    if (!confirm(`Deseja realmente excluir o áudio "${name}"?`)) return;
    
    const audioKey = `manual_audio_${name}`;
    localStorage.removeItem(audioKey);
    
    const fileId = `audio_${name.replace(/\s+/g, '_')}`;
    deleteLocalFile(fileId);
    
    toast.success('Áudio excluído');
    setRefresh(prev => prev + 1);
  };

  const getUploadedAudios = (): string[] => {
    const audios: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('manual_audio_')) {
        const name = key.replace('manual_audio_', '');
        audios.push(name);
      }
    }
    return audios;
  };

  const uploadedAudios = getUploadedAudios();

  const setPreferredAudio = (name: string) => {
    localStorage.setItem('preferred_alert_manual_audio', name);
    toast.success(`Áudio "${name}" definido como padrão`);
    setRefresh(prev => prev + 1);
  };

  const preferredAudio = localStorage.getItem('preferred_alert_manual_audio');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Gerenciar Áudios de Alerta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
          <Label>Adicionar Novo Áudio</Label>
          <Input
            placeholder="Nome do áudio (ex: Alerta1, Sino, etc)"
            value={audioName}
            onChange={(e) => setAudioName(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              disabled={uploading || !audioName.trim()}
              className="flex-1"
            />
            <Button type="button" disabled={uploading || !audioName.trim()} size="icon" variant="outline">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: MP3, WAV, OGG. Máximo 5MB.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Áudios Disponíveis ({uploadedAudios.length})</Label>
          {uploadedAudios.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum áudio personalizado. Faça upload acima.
            </p>
          ) : (
            <div className="space-y-2">
              {uploadedAudios.map((name) => (
                <Card key={name} className={`p-3 ${preferredAudio === name ? 'border-green-500 bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{name}</p>
                      {preferredAudio === name && (
                        <p className="text-xs text-green-600">Padrão</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => playManualAudio(name)}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      {preferredAudio !== name && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPreferredAudio(name)}
                        >
                          Padrão
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAudio(name)}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>Espaço usado: {(storageUsage.used / 1024 / 1024).toFixed(2)} MB ({storageUsage.percentage.toFixed(1)}%)</p>
        </div>
      </CardContent>
    </Card>
  );
}
