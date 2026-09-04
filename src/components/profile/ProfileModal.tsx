import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartPulse, CheckCircle2, ShieldCheck, Sparkles, User, LogOut, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { UserHealthProfile, AgeGroup, HealthCondition, Occupation, ActivityLevel, ProfilePreset } from '../../types/profile';
import { useAuth } from '../../hooks/useAuth';

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

  // Authentication State
  const { user, isAuthenticated, signIn, signUp, signOut, authError, authMessage, isConfigured, clearError } = useAuth();
  const [showAuthSection, setShowAuthSection] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [prevProfile, setPrevProfile] = useState(profile);
  if (prevProfile !== profile) {
    setPrevProfile(profile);
    setFormData(profile);
  }

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
    clearError();

    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email, password);
        if (!error) {
          setShowAuthSection(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          setShowAuthSection(false);
          setEmail('');
          setPassword('');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

            {/* Supabase Authentication & Profile Sync Section */}
            <div className="mb-5">
              {isAuthenticated && user ? (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="truncate max-w-[180px] sm:max-w-[260px]">{user.email}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          {isConfigured ? 'Cloud Synced' : 'Local Account'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isConfigured ? 'PostgreSQL profile persistence & advisory history active' : 'Local account persistence active (Add Supabase keys in .env for Cloud)'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={signOut}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-800/40 border border-white/10 overflow-hidden">
                  <div
                    onClick={() => setShowAuthSection(!showAuthSection)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {isConfigured ? 'Supabase Account & Cloud Sync' : 'User Account & Cloud Sync'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isConfigured ? 'Sign in to persist your clinical profile and save advisory history' : 'Sign in or create account to test profile persistence'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                    >
                      {showAuthSection ? 'Close' : 'Sign In / Register'}
                    </button>
                  </div>

                  {/* Collapsible Auth Form */}
                  <AnimatePresence>
                    {showAuthSection && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 p-4 bg-slate-950/40 space-y-3"
                      >
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 text-xs">
                          <button
                            type="button"
                            onClick={() => { setAuthMode('signin'); clearError(); }}
                            className={`pb-1 font-bold transition-colors cursor-pointer ${
                              authMode === 'signin' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Sign In
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAuthMode('signup'); clearError(); }}
                            className={`pb-1 font-bold transition-colors cursor-pointer ${
                              authMode === 'signup' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Create Account
                          </button>
                        </div>

                        {authError && (
                          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{authError}</span>
                          </div>
                        )}

                        {authMessage && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{authMessage}</span>
                          </div>
                        )}

                        <form onSubmit={handleAuthSubmit} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Email Address</span>
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              required
                              className="w-full px-3 py-2 text-xs bg-slate-850 bg-slate-800/80 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                              <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Password</span>
                            </label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              minLength={6}
                              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {authLoading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <span>{authMode === 'signin' ? 'Sign In to Account' : 'Register New Account'}</span>
                            )}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
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
                  {isAuthenticated ? 'Saves to Supabase PostgreSQL & local cache.' : 'Saves to localStorage & re-evaluates risk.'}
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
