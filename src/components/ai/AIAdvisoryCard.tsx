import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { RecommendationList } from './RecommendationList';
import { AvoidanceList } from './AvoidanceList';
import { AIAdvisory } from '../../types/advisory';
import { Sparkles, RefreshCw, Bot, Shield, Clock, Droplets } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface AIAdvisoryCardProps {
  advisory: AIAdvisory | null;
  isGenerating: boolean;
  onRefresh: () => void;
}

export const AIAdvisoryCard: React.FC<AIAdvisoryCardProps> = ({
  advisory,
  isGenerating,
  onRefresh,
}) => {
  return (
    <Card
      variant="elevated"
      className="border-2 border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-md relative overflow-hidden"
    >
      {/* Background ambient glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-emerald-900/40 pb-4 relative">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
            <Bot className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Personalized Health Advisory
              </h2>
              <Badge variant="primary" size="sm">
                LLM Engine Ready
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized guidance synthesized from atmospheric data & your health profile
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isGenerating}
            leftIcon={<RefreshCw className="h-3.5 w-3.5 mr-1" />}
            className="hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Refresh AI Advisory
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isGenerating ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : advisory ? (
        <div className="space-y-6 pt-5">
          {/* Main Narrative Advisory Text */}
          <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm">
            <div className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{advisory.headline}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              {advisory.summary}
            </p>
          </div>

          {/* Quick Metrics Bar: Safe Windows, Hydration, Mask */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block font-medium">Safe Activity Window</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {advisory.safeOutdoorWindows[0] || 'Early Morning'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block font-medium">Target Hydration</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {advisory.hydrationTargetLiters} Liters / day
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block font-medium">Mask Protection</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {advisory.maskRecommendation}
                </span>
              </div>
            </div>
          </div>

          {/* Structured Recommendation Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecommendationList items={advisory.recommendedActions} />
            <AvoidanceList items={advisory.considerAvoiding} />
          </div>

          {/* Footer Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
            <span>Model: {advisory.modelIdentifier} • Confidence: {Math.round(advisory.confidenceScore * 100)}%</span>
            <span>Generated {formatRelativeTime(advisory.generatedAt)}</span>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
