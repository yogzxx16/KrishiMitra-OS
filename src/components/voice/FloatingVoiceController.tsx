import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';
import { useVoice } from '../../contexts/VoiceContext';
import { useAppStore } from '../../store/appStore';
import { VOICE_SCRIPTS } from '../../config/constants';
import { formatINRLakhs, formatCubicMeters } from '../../utils/formatters';

// ─── Audio Wave Visualizer ────────────────────────────────────────────────────

function WaveVisualizer({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-0.5 h-6" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`w-0.5 bg-[var(--color-goi-green)] rounded-full wave-bar ${active ? '' : 'opacity-0'}`}
          style={{ height: `${8 + (i % 3) * 6}px` }}
        />
      ))}
    </div>
  );
}

// ─── Pulsing Ring ─────────────────────────────────────────────────────────────

function PulsingRing({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-full bg-green-200"
        animate={{ scale: [1, 1.6, 1.4], opacity: [0.6, 0, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-green-100"
        animate={{ scale: [1, 1.9, 1.6], opacity: [0.4, 0, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
      />
    </>
  );
}

// ─── Main Controller ──────────────────────────────────────────────────────────

export function FloatingVoiceController() {
  const { voiceState, speak, stopSpeaking, isSupported } = useVoice();
  const { preferences, recommendations } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSpeak = useCallback(() => {
    if (voiceState.isSpeaking) {
      stopSpeaking();
      return;
    }

    const topCrop = recommendations[0];
    if (!topCrop) {
      speak('Please complete the form and evaluate crops first.', preferences.language);
      return;
    }

    const scriptFn = VOICE_SCRIPTS[preferences.language];
    const text = scriptFn(
      topCrop.crop.name,
      formatINRLakhs(topCrop.profit.netProfitPerAcre),
      formatCubicMeters(topCrop.profit.waterSavedCubicMeters)
    );

    speak(text, preferences.language);
  }, [voiceState.isSpeaking, speak, stopSpeaking, recommendations, preferences.language]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold shadow-sm">
          <MicOff className="h-4 w-4" />
          Voice not supported
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl p-4 w-72 border border-gray-200 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[var(--color-goi-navy)]">Digital Assistant</p>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close voice panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="p-2 rounded bg-white border border-gray-200 shadow-sm">
                {voiceState.isSpeaking ? (
                  <Volume2 className="h-4 w-4 text-[var(--color-goi-green)]" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700">
                  {voiceState.isSpeaking
                    ? 'Speaking…'
                    : recommendations[0]
                      ? `Top crop: ${recommendations[0].crop.name}`
                      : 'No recommendations yet'}
                </p>
                {voiceState.isSpeaking && <WaveVisualizer active={voiceState.isSpeaking} />}
              </div>
            </div>

            {voiceState.error && (
              <p className="text-xs text-red-600 mt-2 font-medium">{voiceState.error}</p>
            )}

            <button
              onClick={handleSpeak}
              className={[
                'w-full mt-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm',
                voiceState.isSpeaking
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : 'bg-[var(--color-goi-green)] text-white hover:bg-green-800',
              ].join(' ')}
            >
              {voiceState.isSpeaking ? '⏹ Stop Audio' : '▶ Read Report Aloud'}
            </button>

            <p className="text-[10px] text-gray-500 font-medium text-center mt-3 uppercase tracking-wider">
              Language: {preferences.language} ·{' '}
              {voiceState.isSpeaking ? 'Active' : 'Ready'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <div className="relative">
        <PulsingRing active={voiceState.isSpeaking || voiceState.isListening} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded((e) => !e)}
          className={[
            'relative h-14 w-14 rounded-full flex items-center justify-center shadow-lg',
            'transition-colors duration-200 border-2',
            voiceState.isSpeaking
              ? 'bg-[var(--color-goi-green)] border-[var(--color-goi-green)] text-white'
              : 'bg-white border-gray-200 text-[var(--color-goi-navy)] hover:border-[var(--color-goi-green)]',
          ].join(' ')}
          aria-label={isExpanded ? 'Close voice assistant' : 'Open voice assistant'}
        >
          <Mic
            className="h-6 w-6"
            aria-hidden="true"
          />
        </motion.button>
      </div>
    </div>
  );
}
