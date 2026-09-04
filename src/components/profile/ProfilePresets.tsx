import React from 'react';
import { ProfilePreset } from '../../types/profile';
import { Sparkles, UserCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProfilePresetsProps {
  presets: ProfilePreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: ProfilePreset) => void;
}

export const ProfilePresets: React.FC<ProfilePresetsProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
        <span>Quick Demo Presets:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {presets.map((p) => {
          const isSelected = activePresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={cn(
                'p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between',
                isSelected
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-500'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  {p.name}
                </span>
                {isSelected && <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {p.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
