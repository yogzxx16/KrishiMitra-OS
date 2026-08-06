import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatINRLakhs, formatINR } from '../../utils/formatters';
import type { CropRecommendation } from '../../types';
import { computeNetProfit } from '../../utils/engine';
import { CROP_BASELINE_DATA } from '../../config/constants';

interface TrueProfitChartProps {
  recommendations: CropRecommendation[];
  acreage: number;
}

interface ChartEntry {
  name: string;
  profit: number;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
      <p className="text-sm font-bold text-gray-900 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-gray-700">
          Net Profit:{' '}
          <span className="font-bold text-[var(--color-goi-green)]">
            {formatINR(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
};

export const TrueProfitChart = React.memo(function TrueProfitChart({
  recommendations,
  acreage,
}: TrueProfitChartProps) {
  const data = useMemo((): ChartEntry[] => {
    // Baseline crops
    const baselines: ChartEntry[] = [
      {
        name: 'Paddy 🌾',
        profit: computeNetProfit(CROP_BASELINE_DATA['paddy']!, acreage).netProfitINR,
        color: '#9CA3AF', // gray-400
      },
      {
        name: 'Sugarcane 🎋',
        profit: computeNetProfit(CROP_BASELINE_DATA['sugarcane']!, acreage).netProfitINR,
        color: '#D1D5DB', // gray-300
      },
    ];

    const recs: ChartEntry[] = recommendations.map((r) => ({
      name: `${r.crop.emoji} ${r.crop.name}`,
      profit: r.profit.netProfitINR,
      color: r.crop.colorSecondary,
    }));

    return [...baselines, ...recs];
  }, [recommendations, acreage]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-2 rounded bg-green-50">
          <TrendingUp className="h-5 w-5 text-[var(--color-goi-green)]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-goi-navy)]">True Profit Comparison</h3>
          <p className="text-sm text-gray-600 font-medium">
            Projected net income vs baseline crops for {acreage.toFixed(1)} acres
          </p>
        </div>
      </div>

      <div style={{ height: 320, minHeight: 320, width: '100%' }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatINRLakhs(v).replace('₹', '')}
              tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
