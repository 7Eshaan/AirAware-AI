import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartPulse, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { UserHealthProfile, AgeGroup, HealthCondition, Occupation, ActivityLevel, ProfilePreset } from '../../types/profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserHealthProfile;
  presets: ProfilePreset[];
  activePresetId: string | null;
  onUpdateProfile: (profile: UserHealthProfile) => void;
  onSelectPreset: (preset: ProfilePreset) => void;
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

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  presets,
  activePresetId,
  onUpdateProfile,
  onSelectPreset,
}) => {
  const [formData, setFormData] = useState<UserHealthProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleConditionToggle = (condition: HealthCondition) => {
    if (condition === 'No Known Condition') {
      setFormData((prev) => ({ ...prev, healthConditions: ['No Known Condition'] }));
      return;
    }

    setFormData((prev) => {
      const withoutNoKnown = prev.healthConditions.filter((c) => c !== 'No Known Condition');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900/90 text-white border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Your Health Profile
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Personal vulnerability parameters for the 3D environmental risk engine
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Preset Profiles:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setFormData(preset.profile);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-white">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Age Group
                  </label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-800/80 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                  >
                    {AGE_GROUPS.map((a) => (
                      <option key={a} value={a} className="bg-slate-900 text-white">{a}</option>
                    ))}
                  </select>
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Occupation / Exposure
                  </label>
                  <select
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value as Occupation })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-800/80 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                  >
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o} className="bg-slate-900 text-white">{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Outdoor Activity Intensity
                </label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-800/80 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                >
                  {ACTIVITY_LEVELS.map((act) => (
                    <option key={act} value={act} className="bg-slate-900 text-white">{act}</option>
                  ))}
                </select>
              </div>

              {/* Health Conditions */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Health Conditions (Multi-select)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HEALTH_CONDITIONS.map((cond) => {
                    const isChecked = formData.healthConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => handleConditionToggle(cond)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{cond}</span>
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Saves to localStorage & re-evaluates risk.
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Apply Profile</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
