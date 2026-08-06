// ============================================================
// KrishiMitra OS — AI Diagnostics Camera Module
// ============================================================

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle2, ShieldAlert, ThermometerSun, Leaf, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import { generateReportFromLabel, compressImage, AIDiagnosticReport } from '../../services/gemini';
import { initModel, predict } from '../../services/teachableMachine';

const TM_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/NuuvRAMbl/';

type LoadingState = 'Uploading Image...' | 'Analyzing Image...' | 'Identifying Issues...' | 'Generating AI Report...';

export function SoilCameraModule() {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [report, setReport] = useState<AIDiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cycling loading states
  useEffect(() => {
    // Initialize Teachable Machine model asynchronously in the background
    initModel(TM_MODEL_URL).catch(console.error);

    if (!isProcessing) return;
    const states: LoadingState[] = [t('diagnostics.loadingUpload', 'Uploading Image...') as LoadingState, t('diagnostics.loadingAnalyze', 'Analyzing Image...') as LoadingState, t('diagnostics.loadingIdentify', 'Identifying Issues...') as LoadingState, t('diagnostics.loadingReport', 'Generating AI Report...') as LoadingState];
    let idx = 0;
    setLoadingState(states[idx]);
    
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setLoadingState(states[idx]!);
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setError(null);
        setReport(null);
        setIsProcessing(true);

        // Preview and Compress
        const base64Data = await compressImage(file);
        setPreview(base64Data);

        // Create an Image object to run through Teachable Machine
        const img = new Image();
        img.src = base64Data;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // 1. Teachable Machine Client-Side Classification
        const tmResult = await predict(img);
        
        // 2. Gemini Generative Report (Hybrid Mode)
        const result = await generateReportFromLabel(tmResult.className);
        
        // Override confidence with the TM prediction confidence
        result.confidence = Math.round(tmResult.probability * 100);
        
        setReport(result);
      } catch (err: any) {
        setError(err.message || 'Failed to analyze the image.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Leaf className="w-5 h-5 text-[var(--color-goi-navy)]" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t('diagnostics.title')}</h3>
          <p className="text-xs text-gray-500">{t('diagnostics.subtitle')}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="camera"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="space-y-4"
        >
          {/* Upload Zone */}
          {!report && (
            <div
              onClick={() => fileRef.current?.click()}
              className="relative flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-[var(--color-goi-green)] bg-gray-50 cursor-pointer transition-all group overflow-hidden"
              role="button"
              tabIndex={0}
              aria-label="Upload crop image"
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Sample preview"
                  className="absolute inset-0 h-full w-full object-cover rounded-xl opacity-50"
                />
              ) : null}
              <div className="relative flex flex-col items-center gap-2 text-center p-4 z-10">
                <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                  <Camera className="h-6 w-6 text-[var(--color-goi-green)]" />
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {preview ? t('diagnostics.uploadChange') : t('diagnostics.uploadPrompt')}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {t('diagnostics.uploadSupport')}
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">{t('diagnostics.analysisFailed')}</p>
                <p className="text-xs text-red-600">{error}</p>
                <button 
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs font-bold text-red-700 hover:underline"
                >
                  {t('diagnostics.tryAgain')}
                </button>
              </div>
            </div>
          )}

          {/* Classification Loading */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100"
              >
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    {loadingState}
                  </p>
                  <p className="text-xs text-blue-700">
                    {t('diagnostics.poweredBy')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* AI Report Results */}
            {report && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-start gap-4 p-4 border-b border-gray-100 bg-gray-50">
                  {preview && (
                    <img src={preview} alt="Analyzed Crop" className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-0.5">{t('diagnostics.identified', { subject: report.subjectType })}</h4>
                        <p className="text-lg font-black text-[var(--color-goi-navy)]">{report.subjectName}</p>
                      </div>
                      <Badge variant="emerald" className="bg-[var(--color-goi-green)] text-white">
                        {report.confidence}{t('diagnostics.match')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                       <p className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1"><Activity className="w-3 h-3"/> {t('diagnostics.disease')}</p>
                       <p className="text-sm font-semibold text-red-900 mt-1">{report.diseaseName || t('diagnostics.healthy')}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                       <p className="text-xs font-bold text-orange-800 uppercase tracking-wide flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> {t('diagnostics.severity')}</p>
                       <p className="text-sm font-semibold text-orange-900 mt-1">{report.severity}</p>
                    </div>
                  </div>

                  {report.diseaseName && (
                    <>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('diagnostics.symptoms')}</p>
                        <div className="flex flex-wrap gap-1">
                          {report.symptoms.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{s}</span>)}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-[var(--color-goi-navy)] uppercase tracking-wider mb-1">{t('diagnostics.treatment')}</p>
                        <p className="text-sm text-gray-800">{report.recommendedTreatment}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('diagnostics.preventive')}</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                           {report.preventiveMeasures.map(p => <li key={p}>{p}</li>)}
                        </ul>
                      </div>
                    </>
                  )}

                  <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('diagnostics.fertilizer')}</p>
                        <p className="text-sm text-gray-800 font-medium">{report.suitableFertilizer}</p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('diagnostics.scheme')}</p>
                        <p className="text-sm text-gray-800 font-medium">{report.governmentScheme}</p>
                     </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <ThermometerSun className="w-4 h-4 text-orange-500" />
                    {t('diagnostics.nextInspection')}: {report.nextInspectionDate}
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => { setReport(null); setPreview(null); }}>
                    {t('diagnostics.scanAnother')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
