import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface RecommendationListProps {
  items: string[];
}

export const RecommendationList: React.FC<RecommendationListProps> = ({ items }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        <span>Recommended Actions</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs text-slate-800 dark:text-slate-200"
          >
            <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
