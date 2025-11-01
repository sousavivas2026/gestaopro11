import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AlertMode = 'disabled' | 'on-order' | 'interval';
type AudioSource = 'server' | 'local';
type SoundType = 'novo_pedido' | 'pedido_concluido' | 'atencao_maquina' | 'compareca_direcao' | 'estoque_baixo';

interface SoundAlertContextType {
  alertMode: AlertMode;
  audioSource: AudioSource;
  setAlertMode: (mode: AlertMode) => void;
  setAudioSource: (source: AudioSource) => void;
  playAlert: (type: SoundType) => void;
  playManualAudio: (name: string) => void;
  testSound: () => void;
  selectedSounds: Record<string, SoundType>;
  setSelectedSound: (context: string, sound: SoundType) => void;
}

const SoundAlertContext = createContext<SoundAlertContextType | undefined>(undefined);

const DEFAULT_SOUNDS: Record<string, SoundType> = {
  'marketplace_new': 'novo_pedido',
  'marketplace_complete': 'pedido_concluido',
  'monitor_external': 'atencao_maquina',
  'stock_alert': 'estoque_baixo',
};

export function SoundAlertProvider({ children }: { children: ReactNode }) {
  const [alertMode, setAlertModeState] = useState<AlertMode>(() => {
    return (localStorage.getItem('alert_mode') as AlertMode) || 'disabled';
  });
  
  const [audioSource, setAudioSourceState] = useState<AudioSource>(() => {
    return (localStorage.getItem('audio_source') as AudioSource) || 'server';
  });

  const [selectedSounds, setSelectedSoundsState] = useState<Record<string, SoundType>>(() => {
    const saved = localStorage.getItem('selected_sounds');
    return saved ? JSON.parse(saved) : DEFAULT_SOUNDS;
  });

  const setAlertMode = useCallback((mode: AlertMode) => {
    setAlertModeState(mode);
    localStorage.setItem('alert_mode', mode);
  }, []);

  const setAudioSource = useCallback((source: AudioSource) => {
    setAudioSourceState(source);
    localStorage.setItem('audio_source', source);
  }, []);

  const setSelectedSound = useCallback((context: string, sound: SoundType) => {
    setSelectedSoundsState(prev => {
      const updated = { ...prev, [context]: sound };
      localStorage.setItem('selected_sounds', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const playAlert = useCallback((type: SoundType) => {
    if (alertMode === 'disabled') return;

    try {
      if (audioSource === 'local') {
        const preferredAudio = localStorage.getItem('preferred_alert_manual_audio');
        if (preferredAudio) {
          playManualAudio(preferredAudio);
          return;
        }
      }

      // Som padrão do servidor
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.play().catch((err) => console.log('Audio play failed:', err));
    } catch (error) {
      console.error('Error playing alert:', error);
    }
  }, [alertMode, audioSource]);

  const playManualAudio = useCallback((name: string) => {
    try {
      const audioKey = `manual_audio_${name}`;
      const audioData = localStorage.getItem(audioKey);
      
      if (!audioData) {
        console.error('Audio not found:', name);
        return;
      }

      const audio = new Audio(audioData);
      audio.play().catch((err) => console.log('Manual audio play failed:', err));
    } catch (error) {
      console.error('Error playing manual audio:', error);
    }
  }, []);

  const testSound = useCallback(() => {
    playAlert('novo_pedido');
  }, [playAlert]);

  return (
    <SoundAlertContext.Provider
      value={{
        alertMode,
        audioSource,
        setAlertMode,
        setAudioSource,
        playAlert,
        playManualAudio,
        testSound,
        selectedSounds,
        setSelectedSound,
      }}
    >
      {children}
    </SoundAlertContext.Provider>
  );
}

export function useSoundAlert() {
  const context = useContext(SoundAlertContext);
  if (!context) {
    throw new Error('useSoundAlert must be used within SoundAlertProvider');
  }
  return context;
}
