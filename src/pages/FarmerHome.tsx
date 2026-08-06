import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CloudRain,
  TrendingUp,
  Map,
  ShieldCheck,
  Landmark,
  BadgeIndianRupee,
  Factory
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WizardFlow } from '../components/farmer/WizardFlow';
import { StructuredReport } from '../components/dashboard/StructuredReport';
import { TrueProfitChart } from '../components/dashboard/TrueProfitChart';
import { WaterSavingsCounter } from '../components/dashboard/WaterSavingsCounter';
import { FPOList } from '../components/market/FPOList';
import { IntentionTokenModal } from '../components/market/IntentionTokenModal';
import { useAppStore } from '../store/appStore';
import { fetchNearbyFPOs } from '../services/fpo';
import type { FPOEntity } from '../types';

function QuickActionCard({ title, icon, onClick }: { title: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow hover:border-[var(--color-goi-saffron)] text-gray-700 hover:text-[var(--color-goi-navy)]"
    >
      <div className="bg-gray-50 p-3 rounded-full mb-3 text-[var(--color-goi-green)]">
        {icon}
      </div>
      <span className="text-sm font-semibold text-center">{title}</span>
    </button>
  );
}

export default function FarmerHome() {
  const { t } = useTranslation();
  const { recommendations, ingestionContext, resetIngestion } = useAppStore();
  const [fpos, setFpos] = useState<FPOEntity[]>([]);
  const [fposLoading, setFposLoading] = useState(false);
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const hasResults = recommendations.length > 0;

  async function handleWizardComplete() {
    setShowWizard(false);
    const loc = ingestionContext.location;
    if (loc) {
      setFposLoading(true);
      try {
        const result = await fetchNearbyFPOs(loc.coordinates);
        setFpos(result.data);
      } finally {
        setFposLoading(false);
      }
    }
  }

  function handleReset() {
    resetIngestion();
    setShowWizard(true);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-6 space-y-8 font-sans">
      {/* Official Government Banner */}
      {!hasResults && !showWizard && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
          {/* Subtle background pattern for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="px-8 py-12 md:py-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-gray-900 max-w-2xl space-y-5">
              <Badge variant="amber" className="bg-orange-50 text-[var(--color-goi-saffron-dark)] border border-orange-200 font-bold uppercase tracking-widest px-3 py-1">
                {t('hero.mission')}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-[var(--color-goi-navy)]">
                {t('hero.title')}
              </h1>
              <p className="text-gray-600 text-lg max-w-xl font-medium">
                {t('hero.subtitle')}
              </p>
              <div className="pt-4">
                <Button size="lg" variant="primary" onClick={() => setShowWizard(true)}>
                  {t('hero.startAnalysis')}
                </Button>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col gap-4 text-center">
              <div className="bg-gray-50 border border-gray-100 shadow-sm p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-[var(--color-goi-green)] mb-1">22k+</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('hero.farmersEnrolled')}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 shadow-sm p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-[var(--color-goi-green)] mb-1">151M</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('hero.waterSaved')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      {!hasResults && !showWizard && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-goi-navy)] border-b border-gray-200 pb-2">
            {t('nav.farmerService')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard title={t('nav.cropSuitability', 'Crop Suitability')} icon={<FileText className="w-6 h-6" />} onClick={() => setShowWizard(true)} />
            <QuickActionCard title={t('nav.agroMeteorology', 'Agro-Meteorology')} icon={<CloudRain className="w-6 h-6" />} />
            <QuickActionCard title={t('nav.marketPrices', 'Market Prices (MSP)')} icon={<TrendingUp className="w-6 h-6" />} />
            <QuickActionCard title={t('nav.nearbyFPOs', 'Nearby FPOs')} icon={<Factory className="w-6 h-6" />} />
            <QuickActionCard title={t('nav.soilHealth', 'Soil Health Card')} icon={<Map className="w-6 h-6" />} />
            <QuickActionCard title={t('nav.subsidies', 'Subsidies & Schemes')} icon={<ShieldCheck className="w-6 h-6" />} />
            <QuickActionCard title={t('nav.yieldPrediction', 'Yield Prediction')} icon={<Landmark className="w-6 h-6" />} />
            <QuickActionCard title={t('nav.financialAssistance', 'Financial Assistance')} icon={<BadgeIndianRupee className="w-6 h-6" />} />
          </div>
        </div>
      )}

      {/* Multi-step Wizard */}
      {showWizard && (
        <div className="py-4">
          <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto">
             <h2 className="text-2xl font-bold text-[var(--color-goi-navy)]">{t('wizard.title', 'Farm Analysis Wizard')}</h2>
             <Button variant="ghost" onClick={() => setShowWizard(false)}>{t('wizard.back', 'Cancel')}</Button>
          </div>
          <WizardFlow onComplete={handleWizardComplete} />
        </div>
      )}

      {/* ─── Results ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasResults && !showWizard && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 no-print">
               <div>
                  <h2 className="text-2xl font-bold text-[var(--color-goi-navy)]">
                    {t('results.officialReport', 'Official Advisory Report')}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{t('results.generatedBy', 'Generated by KrishiMitraOS Agronomic Engine')}</p>
               </div>
               <Button variant="secondary" onClick={handleReset}>
                  {t('results.startNew', 'Start New Analysis')}
               </Button>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <StructuredReport
                  key={rec.crop.id}
                  recommendation={rec}
                  acreage={ingestionContext.acreage}
                  isPrimary={i === 0}
                />
              ))}
            </div>

            <TrueProfitChart
              recommendations={recommendations}
              acreage={ingestionContext.acreage}
            />

            <WaterSavingsCounter topRecommendation={recommendations[0]!} />

            {/* FPO Network */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[var(--color-goi-navy)] mb-4">{t('results.procurementCenters', 'Authorized Procurement Centers')}</h3>
              {fposLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <FPOList
                  fpos={fpos}
                  onIntentionClick={() => setShowIntentionModal(true)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IntentionTokenModal
        isOpen={showIntentionModal}
        onClose={() => setShowIntentionModal(false)}
      />
    </main>
  );
}
