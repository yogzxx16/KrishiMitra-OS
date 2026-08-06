import React from 'react';
import { Modal } from '../ui/Modal';
import { formatINR, formatINRLakhs, formatKg } from '../../utils/formatters';
import type { CropRecommendation } from '../../types';

interface CostBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: CropRecommendation;
}

export function CostBreakdownModal({
  isOpen,
  onClose,
  recommendation,
}: CostBreakdownModalProps) {
  const { crop, profit } = recommendation;
  const costs = crop.inputCosts;

  const costItems = [
    { label: 'Seed Cost', amount: costs.seedCostPerAcre },
    { label: 'Fertilizer', amount: costs.fertilizerCostPerAcre },
    { label: 'Tillage', amount: costs.tillageCostPerAcre },
    { label: 'Labour', amount: costs.laborCostPerAcre },
    { label: 'Irrigation', amount: costs.irrigationCostPerAcre },
    { label: 'Other Expenses', amount: costs.otherCostPerAcre },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${crop.emoji} ${crop.name} — Cost Breakdown`}
      size="md"
    >
      <div className="space-y-5">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Yield / Acre</p>
            <p className="text-lg font-bold text-gray-900">{formatKg(crop.yieldPerAcreKg)}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-200 text-center">
            <p className="text-xs text-orange-700 font-semibold mb-1 uppercase tracking-wide">MSP Rate</p>
            <p className="text-lg font-bold text-orange-700">₹{crop.mspPerKg}/kg</p>
          </div>
        </div>

        {/* Cost Line Items */}
        <div>
          <h3 className="text-xs font-bold text-[var(--color-goi-navy)] uppercase tracking-wider mb-3">
            Input Costs (per acre)
          </h3>
          <div className="space-y-2">
            {costItems.map(({ label, amount }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatINR(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Total Input Cost</span>
            <span className="text-sm font-bold text-red-600">
              − {formatINR(profit.totalInputCostINR)}
            </span>
          </div>
          <div className="flex justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Gross Income</span>
            <span className="text-sm font-bold text-gray-900">
              {formatINR(profit.grossIncomeINR)}
            </span>
          </div>
          <div className="flex justify-between px-4 py-3 bg-green-50">
            <span className="text-base font-bold text-green-800">Net Profit</span>
            <span className="text-base font-bold text-green-800">
              {formatINRLakhs(profit.netProfitINR)}
            </span>
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div>
            <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">
              5-Year ROI (8% growth)
            </p>
            <p className="text-xs font-medium text-blue-600 mt-0.5">Compound annual appreciation</p>
          </div>
          <p className="text-xl font-black text-blue-800">
            {formatINRLakhs(profit.fiveYearROI)}
          </p>
        </div>
      </div>
    </Modal>
  );
}
