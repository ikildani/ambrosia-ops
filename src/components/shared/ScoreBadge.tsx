'use client';

import type { ScoreBadgeProps } from '@/types/scoring';
import { getBucketColor, getBucketLabel } from '@/lib/scoring/engine';

const BREAKDOWN_LABELS: Record<string, string> = {
  companyFit: 'Company Fit',
  relationshipStrength: 'Relationship',
  marketTiming: 'Market Timing',
  advisoryOpportunity: 'Advisory Opp.',
};

function ScoreRing({
  score,
  color,
  size,
}: {
  score: number;
  color: string;
  size: number;
}) {
  const strokeWidth = size > 60 ? 6 : 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;
  const fontSize = size > 60 ? 20 : 14;

  return (
    <svg width={size} height={size} className="block">
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-200 dark:text-zinc-700"
      />
      {/* Progress ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference - progress}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Score text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontFamily="ui-monospace, monospace"
        fontWeight={600}
        fill="currentColor"
        className="text-zinc-900 dark:text-zinc-100"
      >
        {score}
      </text>
    </svg>
  );
}

function BreakdownBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0 text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <div className="relative h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span className="w-8 text-right font-mono text-zinc-600 dark:text-zinc-300">
        {value}
      </span>
    </div>
  );
}

export function ScoreBadge({ score, bucket, size = 'md', breakdown }: ScoreBadgeProps) {
  const color = getBucketColor(bucket);
  const label = getBucketLabel(bucket);

  // ---- Small: inline badge ----
  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-800">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono">{score}</span>
      </span>
    );
  }

  // ---- Medium: ring with score ----
  if (size === 'md') {
    return (
      <div className="flex flex-col items-center gap-1">
        <ScoreRing score={score} color={color} size={56} />
        <span
          className="text-[10px] font-medium uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    );
  }

  // ---- Large: full card with breakdown ----
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start gap-5">
        <ScoreRing score={score} color={color} size={80} />
        <div className="flex-1">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
          {breakdown && (
            <div className="mt-3 space-y-2">
              {(Object.keys(breakdown) as (keyof typeof breakdown)[]).map((key) => (
                <BreakdownBar
                  key={key}
                  label={BREAKDOWN_LABELS[key] ?? key}
                  value={breakdown[key]}
                  max={25}
                  color={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
