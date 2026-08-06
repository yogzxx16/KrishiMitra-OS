import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import {
  Landmark,
  Globe,
  Droplets,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { formatCubicMeters, formatINRLakhs } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

// ─── Mock Telemetry Data ──────────────────────────────────────────────────────

const ADOPTION_TREND = [
  { year: '2022', farmers: 1200, hectares: 3200, waterSaved: 8200000 },
  { year: '2023', farmers: 3400, hectares: 8900, waterSaved: 23100000 },
  { year: '2024', farmers: 7800, hectares: 19600, waterSaved: 52800000 },
  { year: '2025', farmers: 14200, hectares: 36100, waterSaved: 97500000 },
  { year: '2026*', farmers: 22000, hectares: 56000, waterSaved: 151000000 },
];

const DISTRICT_HEATMAP = [
  { district: 'Nagpur', adoptionRate: 34, waterSavedM3: 18400 },
  { district: 'Latur', adoptionRate: 28, waterSavedM3: 12600 },
  { district: 'Amravati', adoptionRate: 42, waterSavedM3: 22100 },
  { district: 'Dhule', adoptionRate: 19, waterSavedM3: 8900 },
  { district: 'Solapur', adoptionRate: 23, waterSavedM3: 11200 },
  { district: 'Yavatmal', adoptionRate: 38, waterSavedM3: 19700 },
];

const MSP_IMPACT = [
  { cropKey: 'gov.crops.soybean', defaultCrop: 'Soybean', msp: 4600, marketPrice: 4820, farmerBenefit: 176000 },
  { cropKey: 'gov.crops.mustard', defaultCrop: 'Mustard', msp: 5950, marketPrice: 5780, farmerBenefit: 102000 },
  { cropKey: 'gov.crops.groundnut', defaultCrop: 'Groundnut', msp: 6377, marketPrice: 6600, farmerBenefit: 201000 },
  { cropKey: 'gov.crops.sunflower', defaultCrop: 'Sunflower', msp: 7280, marketPrice: 7100, farmerBenefit: 126000 },
];

const POLICY_ALERTS = [
  {
    id: 1,
    type: 'success',
    titleKey: 'gov.alerts.alert1.title',
    defaultTitle: 'Oilseed Mission Target: On Track',
    descKey: 'gov.alerts.alert1.desc',
    defaultDesc: '22,000 farmer adoptions projected for Kharif 2026 — exceeding 18,000 baseline target by 22%.',
    time: '2h ago',
  },
  {
    id: 2,
    type: 'warning',
    titleKey: 'gov.alerts.alert2.title',
    defaultTitle: 'Dhule District Lagging',
    descKey: 'gov.alerts.alert2.desc',
    defaultDesc: 'Adoption currently at 19% vs 30% state target. Interventions required in FPO coverage.',
    time: '6h ago',
  },
  {
    id: 3,
    type: 'info',
    titleKey: 'gov.alerts.alert3.title',
    defaultTitle: 'MSP Disbursement Ready',
    descKey: 'gov.alerts.alert3.desc',
    defaultDesc: '₹12.4 Cr MSP procurement payments successfully queued for 1,842 verified farmers.',
    time: '1d ago',
  },
];

// ─── Alert Item ───────────────────────────────────────────────────────────────

function PolicyAlert({
  alert,
}: {
  alert: (typeof POLICY_ALERTS)[number];
}) {
  const { t } = useTranslation();
  const styles = {
    success: { icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    warning: { icon: AlertTriangle, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    info: { icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  }[alert.type] ?? { icon: FileText, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };

  const Icon = styles.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-sm ${styles.bg} ${styles.border}`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${styles.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{t(alert.titleKey, alert.defaultTitle)}</p>
        <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{t(alert.descKey, alert.defaultDesc)}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 shrink-0">
        <Clock className="h-3.5 w-3.5" />
        {alert.time}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GovTelemetry() {
  const { t } = useTranslation();

  return (
    <main className="max-w-7xl mx-auto px-4 pb-16 pt-6 space-y-8 font-sans bg-gray-50 min-h-screen">
      {/* Official Dashboard Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-[var(--color-goi-saffron)]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[var(--color-goi-navy)]">
                {t('gov.title', 'Command Center: National Oilseed Mission')}
              </h1>
              <Badge variant="blue" size="sm" className="hidden sm:inline-flex">
                {t('gov.badge', 'Official Telemetry')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {t('gov.subtitle', 'Real-time adoption metrics & policy impact · Maharashtra · Kharif 2026')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-bold shadow-sm">
          <Globe className="h-4 w-4" />
          <span>{t('gov.status', 'System Status: LIVE')}</span>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('gov.farmerAdoptions', 'Farmer Adoptions'),
            value: '22,000',
            sub: t('gov.yoyGrowth', '+54% YoY Growth'),
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'text-green-700',
            bg: 'bg-green-50',
            border: 'border-green-200'
          },
          {
            label: t('gov.areaUnderOilseeds', 'Area Under Oilseeds'),
            value: '56,000 ha',
            sub: t('gov.projected2026', 'Projected 2026'),
            icon: <Globe className="h-6 w-6" />,
            color: 'text-orange-700',
            bg: 'bg-orange-50',
            border: 'border-orange-200'
          },
          {
            label: t('gov.groundwaterSaved', 'Groundwater Saved'),
            value: formatCubicMeters(151000000),
            sub: t('gov.vsBaseline', 'vs baseline paddy'),
            icon: <Droplets className="h-6 w-6" />,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
          },
          {
            label: t('gov.mspBenefit', 'MSP Benefit Delivered'),
            value: formatINRLakhs(605000000),
            sub: t('gov.dbt', 'Direct benefit transfer'),
            icon: <Landmark className="h-6 w-6" />,
            color: 'text-purple-700',
            bg: 'bg-purple-50',
            border: 'border-purple-200'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
          >
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${stat.bg} opacity-50 pointer-events-none`}></div>
            <div className={`inline-flex p-2.5 rounded-lg mb-4 ${stat.bg} ${stat.border} border`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none mb-1">{stat.value}</p>
            <p className="text-sm font-bold text-gray-700">{stat.label}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoption Trend Area Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-[var(--color-goi-navy)]">
              {t('gov.adoptionTrajectory', 'Farmer Adoption Trajectory (2022–2026)')}
            </h3>
          </CardHeader>
          <CardBody>
            <div style={{ minHeight: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ADOPTION_TREND}>
                  <defs>
                    <linearGradient id="farmersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hectaresGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F57C00" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F57C00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#1F2937',
                      fontWeight: 500
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', fontWeight: 500 }} />
                  <Area
                    type="monotone"
                    dataKey="farmers"
                    stroke="#1B5E20"
                    fill="url(#farmersGrad)"
                    strokeWidth={3}
                    name="Farmers Enrolled"
                  />
                  <Area
                    type="monotone"
                    dataKey="hectares"
                    stroke="#F57C00"
                    fill="url(#hectaresGrad)"
                    strokeWidth={3}
                    name="Hectares Covered"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* District Adoption Bar */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-[var(--color-goi-navy)]">
              {t('gov.districtAdoption', 'District Adoption Rates (%)')}
            </h3>
          </CardHeader>
          <CardBody>
            <div style={{ minHeight: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DISTRICT_HEATMAP} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 50]}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="district"
                    tick={{ fill: '#1F2937', fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#1F2937',
                      fontWeight: 600
                    }}
                    formatter={(v: any) => [`${v}%`, 'Adoption Rate']}
                  />
                  <Bar
                    dataKey="adoptionRate"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  >
                    {DISTRICT_HEATMAP.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.adoptionRate >= 35 ? '#1B5E20' : entry.adoptionRate >= 25 ? '#F57C00' : '#D32F2F'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MSP Impact Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <h3 className="text-lg font-bold text-[var(--color-goi-navy)]">
                {t('gov.mspImpact', 'MSP vs Market Price Analysis')}
              </h3>
            </CardHeader>
            <CardBody className="!p-0">
              <Table className="border-t-0 border-l-0 border-r-0 border-b-0 rounded-none shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('gov.notifiedCrop', 'Notified Crop')}</TableHead>
                    <TableHead>{t('gov.msp', 'Minimum Support Price (₹/kg)')}</TableHead>
                    <TableHead>{t('gov.marketRate', 'Current Market Rate')}</TableHead>
                    <TableHead>{t('gov.farmerBenefit', 'Direct Farmer Benefit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MSP_IMPACT.map((row) => (
                    <TableRow key={row.cropKey}>
                      <TableCell className="font-bold text-gray-900">{t(row.cropKey, row.defaultCrop)}</TableCell>
                      <TableCell className="text-[var(--color-goi-saffron)] font-bold">
                        ₹{row.msp.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">
                        ₹{row.marketPrice.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={row.marketPrice >= row.msp ? 'emerald' : 'amber'}
                          size="sm"
                        >
                          {formatINRLakhs(row.farmerBenefit)} {t('gov.total', 'total')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Policy Alerts */}
        <div className="lg:col-span-1">
          <Card className="h-full">
             <CardHeader>
                <h3 className="text-lg font-bold text-[var(--color-goi-navy)]">
                  {t('gov.activeInterventions', 'Active Interventions')}
                </h3>
             </CardHeader>
             <CardBody className="space-y-4">
                {POLICY_ALERTS.map((alert) => (
                  <PolicyAlert key={alert.id} alert={alert} />
                ))}
             </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
}
