import React from 'react';
import { AlertOctagon, XCircle } from 'lucide-react';

interface AvoidanceListProps {
  items: string[];
}

export const AvoidanceList: React.FC<AvoidanceListProps> = ({ items }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
        <XCircle className="h-4 w-4 text-rose-500" />
        <span>Consider Avoiding</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-xs text-slate-800 dark:text-slate-200"
          >
            <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
