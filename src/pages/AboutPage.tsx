import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Wind,
  ShieldAlert,
  Cpu,
  Bot,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AboutPageProps {
  onBackToDashboard: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToDashboard }) => {
  const roadmapPhases = [
    {
      phase: 'Phase 1',
      title: 'Live Weather Ingestion',
      service: 'weatherService',
      status: 'Ready for Open-Meteo',
      desc: 'Connects to Open-Meteo free tier API for temperature, relative humidity, wind velocity, and maximum UV solar indices.',
    },
    {
      phase: 'Phase 2',
      title: 'Live Atmospheric AQI',
      service: 'aqiService',
      status: 'Ready for Open-Meteo Air Quality',
      desc: 'Integrates real-time particulate (PM2.5, PM10) and gaseous emissions (NO₂, O₃, CO, SO₂) with zero-API-key requirements.',
    },
    {
      phase: 'Phase 3',
      title: 'Deterministic Risk Engine',
      service: 'riskEngine',
      status: 'Implemented in Base Architecture',
      desc: 'Calculates clinically weighted risk multipliers across age tiers, chronic bronchial conditions, and occupational exposure profiles.',
    },
    {
      phase: 'Phase 4',
      title: 'Generative AI Health Synthesis',
      service: 'aiService',
      status: 'Prepared with Structured LLM Prompt',
      desc: 'Synthesizes qualitative clinical health guidance using Gemini Flash LLM structured JSON output for actionable personal protection.',
    },
    {
      phase: 'Phase 5',
      title: 'Longitudinal Health Analytics',
      service: 'storageService',
      status: 'LocalStorage Persistent',
      desc: 'Maintains chronological alert logs, threshold violations, and trends for clinical consultation and preventive lifestyle management.',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            About AirAware AI
          </h1>
          <Badge variant="primary" size="sm">
            Architecture & Methodology
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          AirAware AI bridges the gap between generic meteorological alerts and actionable, personalized clinical guidance.
        </p>
      </div>

      {/* Core Product Formula */}
      <Card variant="elevated" className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900">
        <div className="text-center py-4">
          <Badge variant="primary" size="md" className="mb-3">
            The AirAware Formula
          </Badge>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-base sm:text-xl font-bold text-slate-900 dark:text-white">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              Live Environment
            </span>
            <span className="text-slate-400">+</span>
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
              Personal Profile
            </span>
            <span className="text-slate-400">+</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              Risk Engine
            </span>
            <span className="text-slate-400">+</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              AI Guidance
            </span>
            <span className="text-slate-400">=</span>
            <span className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              Personalized Health Advisory
            </span>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Traditional weather apps display static numbers (e.g. "AQI 142"). AirAware AI answers: <em>"What does this specific air quality mean for an outdoor worker with asthma, and what concrete steps must they take today?"</em>
          </p>
        </div>
      </Card>

      {/* Methodology Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="bordered" className="space-y-3">
          <div className="p-2 w-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wind className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            1. US EPA & WHO Benchmarks
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            AQI scales follow standard US EPA breakpoints (0–500), cross-referenced against WHO 2021 air quality guideline thresholds for PM2.5 (15 µg/m³ 24h) and PM10 (45 µg/m³ 24h).
          </p>
        </Card>

        <Card variant="bordered" className="space-y-3">
          <div className="p-2 w-fit rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            2. Deterministic Risk Matrix
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Mathematical vulnerability scaling assigns weighted risk multipliers: age group vulnerabilities, respiratory hypersensitivity, and occupational minute-ventilation rates.
          </p>
        </Card>

        <Card variant="bordered" className="space-y-3">
          <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            3. AI Synthesis Architecture
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Prepared LLM prompt engineering formats atmospheric telemetry, clinical profile factors, and risk scores into structured clinical advisories with specific actions and avoidances.
          </p>
        </Card>
      </div>

      {/* Future Roadmap / Implementation Scope */}
      <Card variant="elevated" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Future Phase Implementation Architecture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Engineered modular services ready to be connected phase by phase without modifying UI presentation layers
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {roadmapPhases.map((phase) => (
            <div key={phase.phase} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {phase.phase}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {phase.title}
                  </span>
                  <code className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono">
                    {phase.service}
                  </code>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {phase.desc}
                </p>
              </div>

              <Badge variant="primary" size="sm" className="shrink-0 self-start sm:self-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {phase.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
