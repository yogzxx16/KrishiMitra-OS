// ============================================================
// KrishiMitra OS — Voice Context (Web Speech API)
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SPEECH_LOCALE } from '../config/constants';
import type { LanguageCode, VoiceState } from '../types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface VoiceContextValue {
  voiceState: VoiceState;
  speak: (text: string, lang?: LanguageCode) => void;
  stopSpeaking: () => void;
  startListening: (lang?: LanguageCode) => void;
  stopListening: () => void;
  isSupported: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const VoiceContext = createContext<VoiceContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;
    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string, lang: LanguageCode = 'en') => {
      if (!isSupported || !synthRef.current) return;

      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LOCALE[lang];
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang === SPEECH_LOCALE[lang]
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () =>
        setVoiceState((s) => ({ ...s, isSpeaking: true, error: null }));
      utterance.onend = () =>
        setVoiceState((s) => ({ ...s, isSpeaking: false }));
      utterance.onerror = (e) =>
        setVoiceState((s) => ({
          ...s,
          isSpeaking: false,
          error: `Speech error: ${e.error}`,
        }));

      synthRef.current.speak(utterance);
    },
    [isSupported]
  );

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setVoiceState((s) => ({ ...s, isSpeaking: false }));
  }, []);

  const startListening = useCallback(
    (lang: LanguageCode = 'en') => {
      if (!isSupported) return;

      const SpeechRecognitionAPI =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) return;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = SPEECH_LOCALE[lang];
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () =>
        setVoiceState((s) => ({ ...s, isListening: true, error: null }));

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        setVoiceState((s) => ({ ...s, transcript, isListening: false }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) =>
        setVoiceState((s) => ({
          ...s,
          isListening: false,
          error: `Recognition error: ${event.error}`,
        }));

      recognition.onend = () =>
        setVoiceState((s) => ({ ...s, isListening: false }));

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err: any) {
        setVoiceState((s) => ({
          ...s,
          isListening: false,
          error: `Microphone error: ${err?.message || 'Permission denied'}`,
        }));
      }
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState((s) => ({ ...s, isListening: false }));
  }, []);

  return (
    <VoiceContext.Provider
      value={{ voiceState, speak, stopSpeaking, startListening, stopListening, isSupported }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used within <VoiceProvider>');
  return ctx;
}
