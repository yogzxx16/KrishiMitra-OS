import React, { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Droplets, ThermometerSun, Leaf, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Stepper } from '../ui/Stepper';
import { SegmentedControl } from '../ui/SegmentedControl';
import { SoilCameraModule } from '../soil/SoilCameraModule';
import { MapSkeleton } from '../ui/Skeleton';
import { useAppStore } from '../../store/appStore';
import { useAgronomicEngine } from '../../hooks/useAgronomicEngine';
import { ACREAGE_BOUNDS } from '../../config/constants';
import { formatAcreage } from '../../utils/formatters';
import type { IrrigationType, SoilTextureType, SoilProfile } from '../../types';
import { SOIL_LABELS } from '../../config/constants';
import { useTranslation } from 'react-i18next';

const MapPicker = lazy(() => import('../map/MapPicker').then((m) => ({ default: m.MapPicker })));

const SOIL_OPTIONS: { value: SoilTextureType; label: string }[] = [
  { value: 'black_soil', label: 'Black Soil' },
  { value: 'alluvial_soil', label: 'Alluvial Soil' },
  { value: 'red_and_yellow_soil', label: 'Red and Yellow Soil' },
  { value: 'arid_soil', label: 'Arid Soil' },
];

const IRRIGATION_OPTIONS: Array<{ label: string; value: IrrigationType }> = [
  { label: 'Rainfed', value: 'rainfed' },
  { label: 'Borewell', value: 'borewell' },
  { label: 'Canal', value: 'canal' },
];

const STEPS = [
  { id: 1, label: 'Location' },
  { id: 2, label: 'Soil Details' },
  { id: 3, label: 'Land & Water' },
  { id: 4, label: 'Analysis' },
];

interface WizardFlowProps {
  onComplete: () => void;
}

export function WizardFlow({ onComplete }: WizardFlowProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const {
    ingestionContext,
    isEngineRunning,
    engineError,
    setAcreage,
    setIrrigationType,
    setSoilProfile,
  } = useAppStore();
  const { evaluate, engineMode } = useAgronomicEngine();

  const handleManualSoilSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const texture = e.target.value as SoilTextureType;
    if (texture) {
      setSoilProfile({
        texture,
        organicMatter: 2.0,
        pH: 7.0,
        nitrogen: 'medium',
        phosphorus: 'medium',
        potassium: 'medium',
        classificationLabel: SOIL_LABELS[texture],
        confidence: 100,
      });
    }
  };

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleEvaluate = async () => {
    setCurrentStep(4);
    await evaluate();
    onComplete();
  };

  const isStep1Valid = ingestionContext.location !== null;
  const isStep2Valid = ingestionContext.soilProfile !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-full max-w-3xl mx-auto mb-10">
      <div className="mb-8 overflow-hidden pt-2">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="min-h-[400px] py-4">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[var(--color-goi-navy)]" />
                <h3 className="text-lg font-bold text-gray-900">Select Farm Location</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Pinpoint your farm on the map to fetch relevant local weather and climate data.
              </p>
              <div className="h-[300px]">
                <Suspense fallback={<MapSkeleton />}>
                  <MapPicker />
                </Suspense>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-[var(--color-goi-navy)]" />
                <h3 className="text-lg font-bold text-gray-900">Soil & Diagnostics</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Select your primary soil type to determine crop suitability. You can also use our AI diagnostics to identify crop diseases or pests.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('wizard.orManual')}</label>
                <select
                  value={ingestionContext.soilProfile?.texture || ''}
                  onChange={handleManualSoilSelect}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[var(--color-goi-green)] focus:border-[var(--color-goi-green)] block p-2.5 shadow-sm"
                >
                  <option value="" disabled>Select soil type...</option>
                  {SOIL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <SoilCameraModule />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-[var(--color-goi-navy)]" />
                <h3 className="text-lg font-bold text-gray-900">Land & Irrigation Details</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="acreage-slider" className="text-sm font-semibold text-gray-700">
                      {t('wizard.acreage')}
                    </label>
                    <span className="text-sm font-bold text-[var(--color-goi-green)] bg-green-50 px-3 py-1 rounded border border-green-200">
                      {formatAcreage(ingestionContext.acreage)}
                    </span>
                  </div>
                  <input
                    id="acreage-slider"
                    type="range"
                    min={ACREAGE_BOUNDS.min}
                    max={ACREAGE_BOUNDS.max}
                    step={ACREAGE_BOUNDS.step}
                    value={ingestionContext.acreage}
                    onChange={(e) => setAcreage(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-goi-green)]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                    <span>{ACREAGE_BOUNDS.min} Acres</span>
                    <span>{ACREAGE_BOUNDS.max} Acres</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 block mb-3">
                    {t('wizard.irrigation')}
                  </label>
                  <SegmentedControl
                    options={IRRIGATION_OPTIONS}
                    value={ingestionContext.irrigationType}
                    onChange={setIrrigationType}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[300px] text-center space-y-6"
            >
              {engineError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 max-w-md">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm text-left">{engineError}</p>
                </div>
              ) : (
                <>
                  <Loader2 className="w-12 h-12 text-[var(--color-goi-green)] animate-spin" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Generating Official Recommendation</h3>
                    <p className="text-sm text-gray-600 max-w-sm">
                      {engineMode === 'locating' && 'Verifying geographic coordinates...'}
                      {engineMode === 'weather' && 'Fetching 5-year agrometeorological data...'}
                      {engineMode === 'ai' && 'Applying AI agronomic models...'}
                      {(engineMode === 'fallback' || engineMode === 'done') && 'Finalizing government advisory report...'}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            {t('wizard.back')}
          </Button>
          
          {currentStep === 1 && (
            <Button onClick={handleNext} disabled={!isStep1Valid} rightIcon={<ChevronRight className="w-4 h-4" />}>
              {t('wizard.proceedSoil')}
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button onClick={handleNext} disabled={!isStep2Valid} rightIcon={<ChevronRight className="w-4 h-4" />}>
              {t('wizard.next')}
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button variant="primary" onClick={handleEvaluate} rightIcon={<ThermometerSun className="w-4 h-4" />}>
              {t('wizard.generateStrategy')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
