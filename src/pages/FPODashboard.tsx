// ============================================================
// KrishiMitra OS — FPO Director Dashboard
// ============================================================

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Droplets,
  Package,
  Award,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { MOCK_FPO_SEED_DATA } from '../config/constants';
import { formatINRLakhs, formatCubicMeters } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

// ─── Mock Aggregate Data ──────────────────────────────────────────────────────

const MONTHLY_INTENTIONS = [
  { month: 'Jan', intentions: 12, fulfilled: 8 },
  { month: 'Feb', intentions: 18, fulfilled: 14 },
  { month: 'Mar', intentions: 24, fulfilled: 19 },
  { month: 'Apr', intentions: 31, fulfilled: 25 },
  { month: 'May', intentions: 28, fulfilled: 22 },
  { month: 'Jun', intentions: 42, fulfilled: 35 },
  { month: 'Jul', intentions: 56, fulfilled: 47 },
  { month: 'Aug', intentions: 61, fulfilled: 51 },
];

const CROP_DISTRIBUTION = [
  { name: 'Soybean', value: 42, color: '#10b981' },
  { name: 'Mustard', value: 28, color: '#f59e0b' },
  { name: 'Groundnut', value: 21, color: '#d97706' },
  { name: 'Sunflower', value: 9, color: '#eab308' },
];

const WATER_SAVINGS_DATA = [
  { district: 'Nagpur', saved: 18400 },
  { district: 'Latur', saved: 12600 },
  { district: 'Dhule', saved: 9800 },
  { district: 'Amravati', saved: 14200 },
  { district: 'Solapur', saved: 7300 },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  delay?: number;
}

function StatCard({ label, value, sub, icon, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
        >
          <span style={{ color }} aria-hidden="true">
            {icon}
          </span>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 mt-3 leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FPODashboard() {
  const { t } = useTranslation();
  const totalMembers = MOCK_FPO_SEED_DATA.reduce(
    (s, f) => s + f.memberCount,
    0
  );

  return (
    <main className="max-w-5xl mx-auto px-4 pb-16 pt-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-[var(--color-goi-navy)] font-display">
            {t('fpo.title', 'FPO Director Dashboard')}
          </h1>
          <Badge variant="amber" size="sm" className="bg-orange-50 border-orange-200 text-orange-800">
            {t('fpo.network', 'Maharashtra Network')}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          {t('fpo.subtitle', 'Aggregated oilseed transition metrics across your FPO cluster')}
        </p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('fpo.totalMembers', 'Total Members')}
          value={totalMembers.toLocaleString('en-IN')}
          sub={t('fpo.acrossFpos', 'Across 3 FPOs')}
          icon={<Users className="h-5 w-5" />}
          trend="+12% MoM"
          color="#10b981"
          delay={0.05}
        />
        <StatCard
          label={t('fpo.activeIntentions', 'Active Intentions')}
          value="252"
          sub={t('fpo.thisSeason', 'This Kharif season')}
          icon={<Package className="h-5 w-5" />}
          trend="+31%"
          color="#f59e0b"
          delay={0.1}
        />
        <StatCard
          label={t('fpo.projectedRevenue', 'Projected Revenue')}
          value={formatINRLakhs(252 * 42000)}
          sub={t('fpo.netProfit', 'Net profit estimate')}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+18%"
          color="#3b82f6"
          delay={0.15}
        />
        <StatCard
          label={t('fpo.waterSaved', 'Water Saved')}
          value={formatCubicMeters(62300)}
          sub={t('fpo.vsBaseline', 'vs paddy baseline')}
          icon={<Droplets className="h-5 w-5" />}
          trend="−65%"
          color="#06b6d4"
          delay={0.2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intentions Timeline */}
        <Card className="!rounded-2xl shadow-sm border border-gray-200 bg-white">
          <CardBody>
            <h3 className="text-sm font-bold text-[var(--color-goi-navy)] mb-4">
              {t('fpo.monthlyTokens', 'Monthly Intention Tokens')}
            </h3>
            <div style={{ minHeight: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_INTENTIONS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      color: '#0f172a'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intentions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name={t('fpo.issued', 'Issued')}
                  />
                  <Line
                    type="monotone"
                    dataKey="fulfilled"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name={t('fpo.fulfilled', 'Fulfilled')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Crop Distribution Pie */}
        <Card className="!rounded-2xl shadow-sm border border-gray-200 bg-white">
          <CardBody>
            <h3 className="text-sm font-bold text-[var(--color-goi-navy)] mb-4">
              {t('fpo.cropIntentDistribution', 'Crop Intent Distribution')}
            </h3>
            <div className="flex items-center gap-4">
              <div style={{ minHeight: '300px', width: '50%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CROP_DISTRIBUTION}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {CROP_DISTRIBUTION.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {CROP_DISTRIBUTION.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs text-gray-600 flex-1">{d.name}</span>
                    <span className="text-xs font-bold text-gray-900">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Water Savings by District */}
        <Card className="!rounded-2xl lg:col-span-2 shadow-sm border border-gray-200 bg-white">
          <CardBody>
            <h3 className="text-sm font-bold text-[var(--color-goi-navy)] mb-4">
              {t('fpo.groundwaterSavings', 'Groundwater Savings by District (m³)')}
            </h3>
            <div style={{ minHeight: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WATER_SAVINGS_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: any) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="district"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      color: '#0f172a'
                    }}
                    formatter={(v: any) => [formatCubicMeters(v), t('fpo.saved', 'Saved')]}
                  />
                  <Bar dataKey="saved" fill="#06b6d4" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* FPO Roster */}
      <div>
        <h2 className="text-base font-bold text-[var(--color-goi-navy)] font-display mb-4">
          {t('fpo.rosterTitle', 'FPO Network Roster')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_FPO_SEED_DATA.map((fpo, i) => (
            <motion.div
              key={fpo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Award className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-[var(--color-goi-navy)] leading-tight">{t(fpo.nameKey || '', fpo.name)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {t(fpo.blockKey || '', fpo.block)}, {t(fpo.districtKey || '', fpo.district)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Users className="h-3 w-3" />
                  {fpo.memberCount} {t('fpo.members', 'members')}
                </div>
                <Badge variant="emerald" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {t('fpo.registered', 'Reg. ✓')}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
