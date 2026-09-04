import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProfilePresets } from './ProfilePresets';
import {
  UserHealthProfile,
  AgeGroup,
  HealthCondition,
  Occupation,
  ActivityLevel,
  ProfilePreset,
} from '../../types/profile';
import { HeartPulse, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface HealthProfilePanelProps {
  profile: UserHealthProfile;
  presets: ProfilePreset[];
  activePresetId: string | null;
  onUpdateProfile: (profile: UserHealthProfile) => void;
  onSelectPreset: (preset: ProfilePreset) => void;
  isSaved?: boolean;
}

const AGE_GROUPS: AgeGroup[] = ['Child', 'Teen', 'Adult', 'Senior Citizen'];

const HEALTH_CONDITIONS: HealthCondition[] = [
  'No Known Condition',
  'Asthma',
  'Respiratory Condition',
  'Heart Condition',
  'Allergy',
];

const OCCUPATIONS: Occupation[] = [
  'Indoor Worker',
  'Outdoor Worker',
  'Student',
  'Athlete',
  'Delivery Worker',
  'Construction Worker',
];

const ACTIVITY_LEVELS: ActivityLevel[] = [
  'Mostly Indoors',
  'Regular Commuting',
  'Outdoor Exercise',
  'Heavy Outdoor Work',
];

export const HealthProfilePanel: React.FC<HealthProfilePanelProps> = ({
  profile,
  presets,
  activePresetId,
  onUpdateProfile,
  onSelectPreset,
  isSaved = false,
}) => {
  const [formData, setFormData] = useState<UserHealthProfile>(profile);

  // Synchronize when external preset is selected
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleConditionToggle = (condition: HealthCondition) => {
    if (condition === 'No Known Condition') {
      setFormData((prev) => ({
        ...prev,
        healthConditions: ['No Known Condition'],
      }));
      return;
    }

    setFormData((prev) => {
      const withoutNoKnown = prev.healthConditions.filter(
        (c) => c !== 'No Known Condition'
      );
      const exists = withoutNoKnown.includes(condition);
      const nextConditions = exists
        ? withoutNoKnown.filter((c) => c !== condition)
        : [...withoutNoKnown, condition];

      return {
        ...prev,
        healthConditions: nextConditions.length > 0 ? nextConditions : ['No Known Condition'],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  return (
    <Card variant="elevated" id="health-profile-section" className="space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Health Profile
            </h2>
            <Badge variant="primary" size="sm">
              Local Storage Persisted
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal physiological factors utilized by the risk intelligence engine
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            Profile Updated & Recalculated!
          </div>
        )}
      </div>

      {/* Preset Profiles for Quick Testing */}
      <ProfilePresets
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
      />

      {/* Form Controls */}
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Age Group Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Age Group
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) =>
                setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              {AGE_GROUPS.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">
              Affects metabolic rate and respiratory sensitivity
            </span>
          </div>

          {/* 2. Occupation / Exposure Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Occupation / Exposure
            </label>
            <select
              value={formData.occupation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  occupation: e.target.value as Occupation,
                })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              {OCCUPATIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">
              Determines hours exposed to ambient outdoor pollutants
            </span>
          </div>

          {/* 3. Activity Level Dropdown */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Activity Level
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  activityLevel: e.target.value as ActivityLevel,
                })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              {ACTIVITY_LEVELS.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">
              Governs volume of air inhaled per minute
            </span>
          </div>
        </div>

        {/* 4. Health Conditions Multi-Select Checkboxes */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Health Conditions (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {HEALTH_CONDITIONS.map((cond) => {
              const isChecked = formData.healthConditions.includes(cond);
              return (
                <label
                  key={cond}
                  onClick={() => handleConditionToggle(cond)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by label click
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>{cond}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Modifications immediately recalculate your deterministic risk assessment.
          </p>
          <Button type="submit" variant="primary" size="md">
            Update Profile
          </Button>
        </div>
      </form>
    </Card>
  );
};
