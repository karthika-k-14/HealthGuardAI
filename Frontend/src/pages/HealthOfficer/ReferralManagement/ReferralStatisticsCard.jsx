import React, { useState } from 'react';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  BarChart2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferralStatisticsCard({ statistics, onSelectStatus }) {
  const [showCharts, setShowCharts] = useState(true);

  if (!statistics) return null;

  const {
    totalReferrals = 0,
    pendingReferrals = 0,
    underReviewReferrals = 0,
    approvedReferrals = 0,
    rejectedReferrals = 0,
    formattedAverageVerificationTime = '2.4 hrs',
    referralsByVillage = [],
    referralsByDisease = [],
    monthlyTrends = [],
  } = statistics;

  const cards = [
    {
      id: 'total',
      label: 'Total Referrals',
      value: totalReferrals,
      icon: Building2,
      tone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-200 dark:border-indigo-900/40',
      statusKey: 'all',
    },
    {
      id: 'pending',
      label: 'Pending Referrals',
      value: pendingReferrals,
      icon: Clock,
      tone: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-200 dark:border-amber-900/40',
      statusKey: 'PENDING',
      highlight: true,
    },
    {
      id: 'approved',
      label: 'Approved Referrals',
      value: approvedReferrals,
      icon: CheckCircle2,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/40',
      statusKey: 'APPROVED',
    },
    {
      id: 'rejected',
      label: 'Rejected Referrals',
      value: rejectedReferrals,
      icon: XCircle,
      tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-200 dark:border-rose-900/40',
      statusKey: 'REJECTED',
    },
    {
      id: 'avgTime',
      label: 'Avg Verification Time',
      value: formattedAverageVerificationTime,
      icon: Activity,
      tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-200 dark:border-sky-900/40',
      statusKey: null,
    },
  ];

  const maxVillageCount = Math.max(1, ...referralsByVillage.map((v) => v.count || 0));
  const maxDiseaseCount = Math.max(1, ...referralsByDisease.map((d) => d.count || 0));
  const maxMonthlyCount = Math.max(1, ...monthlyTrends.map((m) => m.total || 0));

  return (
    <div className="space-y-4">
      {/* 5 Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => card.statusKey && onSelectStatus && onSelectStatus(card.statusKey)}
            className={`surface-card p-4 flex items-center gap-3 transition-all rounded-2xl border ${card.tone} ${
              card.statusKey ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-xs">
              <card.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {card.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Analytics / Charts Header */}
      <div className="surface-card p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Referral Intelligence &amp; Trend Breakdown
            </h3>
          </div>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span>{showCharts ? 'Hide Visuals' : 'Show Visuals'}</span>
            {showCharts ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        <AnimatePresence>
          {showCharts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid gap-6 md:grid-cols-3"
            >
              {/* Referrals By Village */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" />
                  <span>Referrals By Village</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {referralsByVillage.slice(0, 6).map((item) => {
                    const pct = Math.round((item.count / maxVillageCount) * 100);
                    return (
                      <div key={item.village} className="text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                          <span className="truncate">{item.village}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {referralsByVillage.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No village data available</p>
                  )}
                </div>
              </div>

              {/* Referrals By Disease */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  <span>Referrals By Disease</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {referralsByDisease.slice(0, 6).map((item) => {
                    const pct = Math.round((item.count / maxDiseaseCount) * 100);
                    return (
                      <div key={item.disease} className="text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                          <span className="truncate">{item.disease}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {referralsByDisease.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No disease data available</p>
                  )}
                </div>
              </div>

              {/* Monthly Referral Trends */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Monthly Trends (Last 6 Months)</span>
                </div>
                <div className="space-y-2">
                  {monthlyTrends.map((trend) => (
                    <div key={trend.month} className="text-xs flex items-center justify-between gap-2">
                      <span className="w-20 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                        {trend.month}
                      </span>
                      <div className="flex-1 flex items-center gap-1">
                        <div
                          className="h-3 bg-indigo-500/80 rounded-sm"
                          style={{
                            width: `${Math.max(6, (trend.total / maxMonthlyCount) * 60)}%`,
                          }}
                          title={`Total: ${trend.total}`}
                        />
                        <div
                          className="h-3 bg-emerald-500/80 rounded-sm"
                          style={{
                            width: `${Math.max(4, (trend.approved / maxMonthlyCount) * 30)}%`,
                          }}
                          title={`Approved: ${trend.approved}`}
                        />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px] w-6 text-right">
                        {trend.total}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 justify-end">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-xs bg-indigo-500 inline-block" /> Total
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-xs bg-emerald-500 inline-block" /> Approved
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
