'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';

/* ── Mock graph data ──────────────────────────── */

const nodes = [
  { id: 'center', label: 'Ambrosia Ventures', x: 300, y: 200, r: 38, color: '#00c9a7' },
  { id: 'n1', label: 'NeuroGen', x: 120, y: 80, r: 26, color: '#60a5fa' },
  { id: 'n2', label: 'BioVantage', x: 500, y: 90, r: 26, color: '#a78bfa' },
  { id: 'n3', label: 'Apex Capital', x: 140, y: 340, r: 26, color: '#fbbf24' },
  { id: 'n4', label: 'GenVista', x: 480, y: 320, r: 26, color: '#34d399' },
];

const edges = [
  { from: 'center', to: 'n1' },
  { from: 'center', to: 'n2' },
  { from: 'center', to: 'n3' },
  { from: 'center', to: 'n4' },
  { from: 'n1', to: 'n2' },
  { from: 'n3', to: 'n4' },
];

function getNode(id: string) {
  return nodes.find((n) => n.id === id)!;
}

export default function RelationshipGraphPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Relationship Graph"
        subtitle="Visualize connections across your network"
        actions={
          <Link href="/crm/companies/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Companies
            </Button>
          </Link>
        }
      />

      {/* Graph visualization card */}
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 620 420"
            className="w-full"
            style={{ maxHeight: 480 }}
          >
            {/* Background grid dots */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="rgba(100,116,139,0.15)" />
              </pattern>
            </defs>
            <rect width="620" height="420" fill="url(#grid)" />

            {/* Edges */}
            {edges.map((edge) => {
              const from = getNode(edge.from);
              const to = getNode(edge.to);
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgba(100,116,139,0.25)"
                  strokeWidth="1.5"
                  strokeDasharray={edge.from === 'center' ? 'none' : '4 4'}
                />
              );
            })}

            {/* Glow filters */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                {/* Outer glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r + 4}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1"
                  opacity="0.2"
                />
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={`${node.color}15`}
                  stroke={node.color}
                  strokeWidth="1.5"
                />
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f0f4f8"
                  fontSize={node.id === 'center' ? 11 : 10}
                  fontFamily="Sora, system-ui, sans-serif"
                  fontWeight={node.id === 'center' ? 600 : 400}
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-subtle">
          <p className="text-sm text-slate-400">
            Interactive relationship mapping launches when your CRM has 10+ companies and contacts.
          </p>
          <Link href="/crm/companies/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Companies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
