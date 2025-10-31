import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AlertMode = 'disabled' | 'on-order' | 'interval';
type AudioSource = 'server' | 'local';

interface SoundAlertContextType {
  alertMode: AlertMode;
  audioSource: AudioSource;
  setAlertMode: (mode: AlertMode) => void;
  setAudioSource: (source: AudioSource) => void;
  playAlert: (type: 'new-order' | 'critical-stock' | 'general') => void;
  playManualAudio: (name: string) => void;
  testSound: () => void;
}

const SoundAlertContext = createContext<SoundAlertContextType | undefined>(undefined);

export function SoundAlertProvider({ children }: { children: ReactNode }) {
  const [alertMode, setAlertModeState] = useState<AlertMode>(() => {
    return (localStorage.getItem('alert_mode') as AlertMode) || 'disabled';
  });
  
  const [audioSource, setAudioSourceState] = useState<AudioSource>(() => {
    return (localStorage.getItem('audio_source') as AudioSource) || 'server';
  });

  const setAlertMode = useCallback((mode: AlertMode) => {
    setAlertModeState(mode);
    localStorage.setItem('alert_mode', mode);
  }, []);

  const setAudioSource = useCallback((source: AudioSource) => {
    setAudioSourceState(source);
    localStorage.setItem('audio_source', source);
  }, []);

  const playAlert = useCallback((type: 'new-order' | 'critical-stock' | 'general') => {
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
      const audio = new Audio('/notification.mp3');
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
    playAlert('general');
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
