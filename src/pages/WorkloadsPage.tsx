import React, { useState } from 'react';
import { IndustrialWorkload, WorkloadType, GridZone, ActionStatus } from '../types';
import {
  Server,
  Truck,
  Clock,
  ShieldCheck,
  Search,
  Zap,
  Gauge,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

interface WorkloadsPageProps {
  workloads: IndustrialWorkload[];
  zones: GridZone[];
  isAutonomous: boolean;
  onSelectSite: (id: string) => void;
  onOverrideWorkload?: (id: string, status: ActionStatus | 'AUTO') => void;
}

export const WorkloadsPage: React.FC<WorkloadsPageProps> = ({
  workloads,
  zones,
  isAutonomous,
  onSelectSite,
  onOverrideWorkload,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | WorkloadType>('ALL');
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const zoneMap = new Map(zones.map((z) => [z.zone_id, z]));

  const filteredWorkloads = workloads.filter((w) => {
    if (filterType !== 'ALL' && w.type !== filterType) return false;
    if (filterZone !== 'ALL' && w.zone_id !== filterZone) return false;
    if (searchQuery && !w.site_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalMaxKw = workloads.reduce((sum, w) => sum + w.max_kw, 0);
  const totalCurrentKw = workloads.reduce((sum, w) => sum + w.current_kw, 0);
  const totalBaselineKw = workloads.reduce((sum, w) => sum + w.baseline_kw, 0);
  const avgProgress = Math.round(workloads.reduce((sum, w) => sum + w.sla_progress_pct, 0) / workloads.length);
  const overriddenCount = workloads.filter((w) => Boolean(w.override_status)).length;

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Title & Header Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-100 font-sans tracking-tight">
                Industrial Workload Management
              </h2>
              {overriddenCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                  {overriddenCount} Manual Override{overriddenCount > 1 ? 's' : ''} Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Active distributed AI training clusters and commercial EV freight hubs orchestrated across ISO grids
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHowItWorks((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-emerald-400 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              <span>How Management Works</span>
              {showHowItWorks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {overriddenCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  workloads.forEach((w) => {
                    if (w.override_status) {
                      onOverrideWorkload?.(w.id, 'AUTO');
                    }
                  });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset all manual overrides to autonomous mode"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Auto ({overriddenCount})</span>
              </button>
            )}

            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[9px] uppercase font-mono">Total Capacity</span>
              <span className="font-mono font-bold text-zinc-100 text-xs">{(totalMaxKw / 1000).toFixed(1)} MW</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[9px] uppercase font-mono">Dispatched</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{(totalCurrentKw / 1000).toFixed(1)} MW</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[9px] uppercase font-mono">Net Shift</span>
              <span className={`font-mono font-bold text-xs ${totalCurrentKw >= totalBaselineKw ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalCurrentKw >= totalBaselineKw ? `+${((totalCurrentKw - totalBaselineKw) / 1000).toFixed(1)}` : `${((totalCurrentKw - totalBaselineKw) / 1000).toFixed(1)}`} MW
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[9px] uppercase font-mono">Quota Met</span>
              <span className="font-mono font-bold text-zinc-100 text-xs">{avgProgress}%</span>
            </div>
          </div>
        </div>

        {/* How It Works Explainer Panel */}
        {showHowItWorks && (
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex flex-col gap-3 font-sans text-xs text-zinc-300 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-zinc-100 text-sm">How VoltShift Workload Dispatch & Management Works</h4>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Rules-Engine + Gemini Agent</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
              <div className="p-3 rounded-lg bg-zinc-950/70 border border-emerald-500/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    BOOST (Max Load)
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Triggered when local ISO renewables &ge; 60% or carbon &lt; 180 gCO₂/kWh (e.g. CAISO midday solar). Ramps draw up toward maximum nameplate capacity. Also forced if an SLA deadline is imminent (&lt; 3 hours) to prevent contract breach.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-amber-500/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    THROTTLE (Curtail)
                  </span>
                  <ArrowDownRight className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Triggered during high carbon hours (&gt; 240–350 gCO₂/kWh) or peaker ramps. Power draw is throttled down proportionally to the facility&apos;s Flexibility Score (cutting load by 30% to 60% below baseline).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-rose-500/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    DEFER (Standby)
                  </span>
                  <Clock className="h-3.5 w-3.5 text-rose-400" />
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Triggered when grid carbon exceeds 350 gCO₂/kWh and the job deadline is far away (&gt; 5 hours). Scales load down to 15% standby to avoid extreme emissions and peak demand charges.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-cyan-500/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    MANUAL OVERRIDE
                  </span>
                  <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  You can click <strong>BOOST</strong>, <strong>THROTTLE</strong>, or <strong>DEFER</strong> on any facility card below to manually take control. Click <strong>AUTO</strong> anytime to hand control back to the autonomous algorithm.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/80">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-md border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded transition-colors ${filterType === 'ALL' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                All Sites
              </button>
              <button
                type="button"
                onClick={() => setFilterType('AI_TRAINING')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${filterType === 'AI_TRAINING' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <Server className="h-3 w-3 text-cyan-400" />
                <span>AI Compute</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('EV_FLEET')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${filterType === 'EV_FLEET' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <Truck className="h-3 w-3 text-emerald-400" />
                <span>EV Fleets</span>
              </button>
            </div>

            {/* Filter by Zone */}
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="py-1 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All ISO Zones</option>
              <option value="CAISO">CAISO (California)</option>
              <option value="ERCOT">ERCOT (Texas)</option>
              <option value="PJM">PJM (Mid-Atlantic)</option>
              <option value="MISO">MISO (Midwest)</option>
            </select>
          </div>
        </div>

        {/* Workload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredWorkloads.map((w) => {
            const zone = zoneMap.get(w.zone_id);
            const loadPct = Math.round((w.current_kw / w.max_kw) * 100);

            const statusTheme =
              w.status === 'BOOST'
                ? { text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', bar: 'bg-emerald-500' }
                : w.status === 'THROTTLE'
                ? { text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300', bar: 'bg-amber-500' }
                : w.status === 'DEFER'
                ? { text: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30 text-rose-300', bar: 'bg-rose-500' }
                : { text: 'text-zinc-400', badge: 'bg-zinc-800/40 border-zinc-700/60 text-zinc-300', bar: 'bg-zinc-400' };

            return (
              <div
                key={w.id}
                onClick={() => onSelectSite(w.id)}
                className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all flex flex-col justify-between gap-4 cursor-pointer group"
              >
                {/* Site Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          w.type === 'AI_TRAINING'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {w.type === 'AI_TRAINING' ? <Server className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-zinc-400">
                          {w.type === 'AI_TRAINING' ? 'AI Training Pod' : 'EV Commercial Depot'}
                        </span>
                        <h4 className="font-semibold text-zinc-100 text-xs leading-snug group-hover:text-emerald-300 transition-colors">
                          {w.site_name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-3">
                    <span className="font-mono text-zinc-300 font-medium">{w.zone_id}</span>
                    <span>·</span>
                    <span>Flexibility: {(w.flexibility_score * 100).toFixed(0)}%</span>
                  </div>

                  {/* Status, Shift Delta & Interactive Action Switcher */}
                  <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${statusTheme.badge}`}>
                          {w.status}
                        </span>
                        {w.override_status ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                            OVERRIDE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400">
                            AUTO
                          </span>
                        )}
                      </div>
                      <span className={`font-mono text-xs font-bold ${statusTheme.text}`}>
                        {isAutonomous || w.override_status
                          ? w.delta_kw > 0
                            ? `+${w.delta_kw} kW`
                            : `${w.delta_kw} kW`
                          : '0 kW Delta'}
                      </span>
                    </div>

                    {/* Interactive Dispatch Buttons */}
                    <div
                      className="flex items-center justify-between gap-1 pt-1.5 border-t border-zinc-800/60 text-[9px] font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onOverrideWorkload?.(w.id, 'AUTO')}
                        className={`flex-1 py-1 rounded transition-colors text-center font-medium cursor-pointer ${
                          !w.override_status
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold'
                            : 'bg-zinc-950/80 text-zinc-500 hover:text-zinc-300 border border-zinc-900'
                        }`}
                        title="Follow autonomous grid agent"
                      >
                        Auto
                      </button>

                      <button
                        type="button"
                        onClick={() => onOverrideWorkload?.(w.id, 'BOOST')}
                        className={`flex-1 py-1 rounded transition-colors text-center font-medium cursor-pointer ${
                          w.override_status === 'BOOST'
                            ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-950/80 text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-950/30 border border-zinc-900'
                        }`}
                        title="Force BOOST to maximum capacity"
                      >
                        Boost
                      </button>

                      <button
                        type="button"
                        onClick={() => onOverrideWorkload?.(w.id, 'THROTTLE')}
                        className={`flex-1 py-1 rounded transition-colors text-center font-medium cursor-pointer ${
                          w.override_status === 'THROTTLE'
                            ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-950/80 text-amber-400/70 hover:text-amber-300 hover:bg-amber-950/30 border border-zinc-900'
                        }`}
                        title="Force THROTTLE to curtail load"
                      >
                        Throttle
                      </button>

                      <button
                        type="button"
                        onClick={() => onOverrideWorkload?.(w.id, 'DEFER')}
                        className={`flex-1 py-1 rounded transition-colors text-center font-medium cursor-pointer ${
                          w.override_status === 'DEFER'
                            ? 'bg-rose-500 text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-950/80 text-rose-400/70 hover:text-rose-300 hover:bg-rose-950/30 border border-zinc-900'
                        }`}
                        title="Force DEFER to 15% standby"
                      >
                        Defer
                      </button>
                    </div>
                  </div>

                  {/* Power Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400 text-[11px]">Power Draw</span>
                      <span className="text-zinc-100 font-semibold">
                        {w.current_kw.toLocaleString()} <span className="text-zinc-500 font-normal">/ {w.max_kw.toLocaleString()} kW</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${statusTheme.bar}`} style={{ width: `${Math.min(100, loadPct)}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Baseline: {w.baseline_kw.toLocaleString()} kW</span>
                      <span>{loadPct}% Nameplate</span>
                    </div>
                  </div>
                </div>

                {/* Footer: SLA Deadline and Quota Met */}
                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>SLA {w.deadline_hour}:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${w.sla_progress_pct}%` }} />
                    </div>
                    <span className="font-mono text-zinc-200 font-semibold">{w.sla_progress_pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
