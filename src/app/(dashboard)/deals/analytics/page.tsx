'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/* ── Stat cards data ──────────────────────────── */

const stats = [
  { label: 'Total Pipeline Value', value: '$0', icon: DollarSign, highlight: true },
  { label: 'Win Rate', value: '0%', icon: TrendingUp, highlight: false },
  { label: 'Avg Days to Close', value: '0', icon: Clock, highlight: false },
  { label: 'Mandates This Quarter', value: '0', icon: Briefcase, highlight: false },
];

/* ── Mock chart data ──────────────────────────── */

const pipelineByStage: { label: string; value: number; color: string }[] = [];

const revenueByQuarter: { label: string; value: number; color: string }[] = [];

const dealsByTherapyArea: { label: string; value: number; color: string }[] = [];

export default function PipelineAnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pipeline Analytics"
        subtitle="Performance metrics across your mandate portfolio"
        actions={
          <Link href="/deals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Pipeline
            </Button>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p
                  className={`font-mono text-2xl ${
                    stat.highlight ? 'text-teal-400' : 'text-slate-100'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-teal-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pipeline by Stage — horizontal bar */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Pipeline by Stage</h3>
          <div className="space-y-3">
            {pipelineByStage.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono text-slate-300">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue by Quarter — vertical bars */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Revenue by Quarter</h3>
          <div className="flex items-end justify-between gap-3 h-40 px-2">
            {revenueByQuarter.map((item) => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">{item.value}%</span>
                <div className="w-full bg-navy-800 rounded-t-md overflow-hidden" style={{ height: '100%' }}>
                  <div
                    className={`w-full ${item.color} rounded-t-md transition-all duration-700`}
                    style={{ height: `${item.value}%`, marginTop: `${100 - item.value}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Deals by Therapy Area — horizontal bars */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Deals by Therapy Area</h3>
          <div className="space-y-3">
            {dealsByTherapyArea.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono text-slate-300">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
