import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { formatCubicMeters } from '../../utils/formatters';
import type { CropRecommendation } from '../../types';

interface WaterSavingsCounterProps {
  topRecommendation: CropRecommendation;
}

function useCountUp(target: number, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

export function WaterSavingsCounter({ topRecommendation }: WaterSavingsCounterProps) {
  const { crop, profit } = topRecommendation;
  const animatedValue = useCountUp(profit.waterSavedCubicMeters, 1800);

  const waterPct = Math.round(
    (profit.waterSavedCubicMeters /
      ((1200 / 1000) * 4047 * 2)) * // baseline paddy for 2 acres
      100
  );

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-4 border-b border-blue-100 pb-4">
        <div className="p-2.5 rounded bg-blue-100 border border-blue-200">
          <Droplets className="h-5 w-5 text-blue-700" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900">Groundwater Saved</h3>
          <p className="text-sm font-medium text-blue-700">
            vs Paddy baseline · {crop.emoji} {crop.name}
          </p>
        </div>
      </div>

      {/* Animated Counter */}
      <div className="text-center py-6 bg-white rounded-lg border border-blue-100 mb-6 shadow-sm">
        <p
          className="text-5xl font-black text-blue-700 tabular-nums leading-none"
          aria-live="polite"
          aria-label={`${formatCubicMeters(profit.waterSavedCubicMeters)} of groundwater saved`}
        >
          {formatCubicMeters(animatedValue)}
        </p>
        <p className="text-sm font-bold text-blue-600 mt-2 uppercase tracking-wide">of groundwater saved per season</p>
      </div>

      {/* Visual Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm font-semibold text-blue-800">
          <span>Paddy water use: 1,200mm/season</span>
          <span>
            {crop.name}: {crop.waterRequirementMmPerSeason}mm
          </span>
        </div>
        <div className="relative h-4 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
          <div className="absolute inset-y-0 left-0 bg-blue-200 w-full" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - (crop.waterRequirementMmPerSeason / 1200) * 100}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className="absolute inset-y-0 right-0 bg-blue-600 rounded-full"
          />
        </div>
        <p className="text-sm text-blue-800 font-bold text-center mt-2">
          🌊 {waterPct}% less water consumption
        </p>
      </div>
    </div>
  );
}
