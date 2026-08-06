import React from 'react';
import { Download, Printer, Share2, ShieldAlert, CheckCircle, TrendingUp, Droplets, Info, Landmark } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { CropRecommendation } from '../../types';
import { formatINR, formatAcreage } from '../../utils/formatters';

interface StructuredReportProps {
  recommendation: CropRecommendation;
  acreage: number;
  isPrimary?: boolean;
}

export function StructuredReport({ recommendation, acreage, isPrimary = false }: StructuredReportProps) {
  const { crop, score, profit, aiPlan } = recommendation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <article className={`bg-white border ${isPrimary ? 'border-[var(--color-goi-green)] shadow-md' : 'border-gray-200 shadow-sm'} rounded-lg overflow-hidden mb-6`}>
      {/* Report Header */}
      <div className={`p-6 border-b border-gray-200 ${isPrimary ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{crop.name}</h3>
              {isPrimary && (
                <Badge variant="emerald" className="bg-[var(--color-goi-green)] text-white">
                  Highly Recommended
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Suitability Score: <span className="font-bold text-gray-900">{Math.round(score.suitabilityScore * 100)}%</span>
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Button variant="secondary" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Print
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              PDF
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-bold text-[var(--color-goi-navy)] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Executive Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1 text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Expected Yield</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {(crop.yieldPerAcreKg * acreage).toLocaleString()} kg
            </div>
            <div className="text-xs text-gray-500">for {formatAcreage(acreage)}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1 text-green-700">
              <span className="font-serif">₹</span>
              <span className="text-xs font-semibold uppercase">Est. Net Income</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              {formatINR(profit.netProfitINR * acreage)}
            </div>
            <div className="text-xs text-green-600">{formatINR(profit.netProfitPerAcre)} / acre</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-1 text-blue-700">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Water Requirement</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {crop.waterRequirementMmPerSeason} mm
            </div>
            <div className="text-xs text-blue-600">Saves {profit.waterSavedCubicMeters.toLocaleString()} m³ vs Paddy</div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-1 text-orange-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">MSP Protection</span>
            </div>
            <div className="text-lg font-bold text-orange-700">
              {formatINR(crop.mspPerKg)} / kg
            </div>
            <div className="text-xs text-orange-600">Govt. Guaranteed Rate</div>
          </div>
        </div>
      </div>

      {/* AI Cultivation Plan */}
      {aiPlan && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-sm font-bold text-[var(--color-goi-navy)] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            AI Agronomic Guidance
          </h4>
          <p className="text-sm text-gray-700 mb-6 leading-relaxed bg-blue-50 p-4 rounded border border-blue-100 border-l-4 border-l-blue-500">
            <strong>Analysis: </strong>
            {aiPlan.recommendedCrops[0]?.reasoning || "Based on your soil and climate data, this crop presents an optimal balance of low water usage and high market returns."}
          </p>

          <h5 className="text-xs font-bold text-gray-600 uppercase mb-3">Suggested Cultivation Schedule</h5>
          <div className="space-y-3">
            {aiPlan.futureCultivationPlan.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                <div className="w-24 shrink-0 font-semibold text-[var(--color-goi-green)] border-r border-gray-200 pr-2">
                  {step.phase}
                </div>
                <div className="w-32 shrink-0 font-medium text-gray-600 border-r border-gray-200 pr-2">
                  {step.timing}
                </div>
                <div className="flex-1 text-gray-800">
                  {step.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Govt Schemes & Risks */}
      <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <h4 className="text-sm font-bold text-[var(--color-goi-navy)] uppercase tracking-wider mb-3 flex items-center gap-2">
             <Landmark className="w-4 h-4" />
             Applicable Schemes
           </h4>
           <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-1">
             <li>National Mission on Edible Oils (NMEO)</li>
             <li>PM Fasal Bima Yojana (Crop Insurance)</li>
             <li>Pradhan Mantri Krishi Sinchayee Yojana</li>
             <li>Sub-Mission on Seeds and Planting Material</li>
           </ul>
        </div>
        <div>
           <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4" />
             Risk Factors
           </h4>
           <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-1">
             <li>Ensure proper drainage to prevent waterlogging.</li>
             <li>Monitor for early pest infestations during vegetative phase.</li>
             <li>Procurement subject to FPO quota availability.</li>
           </ul>
        </div>
      </div>
    </article>
  );
}
