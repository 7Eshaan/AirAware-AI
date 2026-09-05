import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HeartPulse,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  User,
  LogOut,
  KeyRound,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronRight,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import {
  UserHealthProfile,
  AgeGroup,
  HealthCondition,
  Occupation,
  ActivityLevel,
  ProfilePreset,
} from '../../types/profile';
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
  const {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    authError,
    authMessage,
    isConfigured,
    clearError,
  } = useAuth();

  // Tab State: 'signin' (Apple iCloud inspired) or 'profile' (Health parameters)
  const [activeTab, setActiveTab] = useState<'signin' | 'profile'>(() =>
    isAuthenticated ? 'profile' : 'signin'
  );
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
    }, 750);
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
          setEmail('');
          setPassword('');
          setActiveTab('profile');
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          setEmail('');
          setPassword('');
          setActiveTab('profile');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop with Deep Space Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#020617]/80 backdrop-blur-xl"
          />

          {/* Apple iCloud-inspired Obsidian Card (640px Max Width) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[640px] max-h-[92vh] overflow-y-auto bg-[#1C1C1E]/95 text-white border border-white/10 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',sans-serif]"
            style={{ isolation: 'isolate' }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Apple iCloud Style Segmented Tab Control */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex p-1 bg-black/40 border border-white/10 rounded-full text-xs font-medium text-slate-300 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    clearError();
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-white/15 text-white shadow-sm font-semibold'
                      : 'hover:text-white text-slate-400'
                  }`}
                >
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
                  {isAuthenticated && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    clearError();
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-white/15 text-white shadow-sm font-semibold'
                      : 'hover:text-white text-slate-400'
                  }`}
                >
                  <HeartPulse className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Health Profile</span>
                </button>
              </div>
            </div>

            {/* TAB 1: APPLE iCLOUD-INSPIRED SIGN IN / ACCOUNT TAB */}
            {activeTab === 'signin' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* AirAware Planetary Biosphere Holographic Emblem */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                    {/* Glowing outer orbital rings */}
                    <div className="absolute inset-0 rounded-full border border-emerald-500/30 border-dashed animate-spin" style={{ animationDuration: '24s' }} />
                    <div className="absolute inset-1.5 rounded-full border border-cyan-400/30 border-t-cyan-400 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} />
                    
                    {/* Inner Orb with Radial Gradient */}
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600/40 via-slate-800 to-cyan-500/40 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                      <Activity className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-white/95">
                    {isAuthenticated ? 'AirAware Account' : 'Sign in with AirAware'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {isAuthenticated
                      ? 'Your clinical vulnerability parameters & advisory timeline are synchronized.'
                      : 'Seamlessly synchronize your clinical health profile and longitudinal 3D telemetry.'}
                  </p>
                </div>

                {/* Authenticated Account Card */}
                {isAuthenticated && user ? (
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-base">
                          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white truncate max-w-[220px] sm:max-w-[300px]">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{isConfigured ? 'Supabase Cloud Connected' : 'Local Persistence'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={signOut}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <span>PostgreSQL Profile RLS</span>
                      <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                        ACTIVE • ENCRYPTED
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Configure Health Profile</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Unauthenticated: Apple iCloud-Inspired Sign In Form */
                  <div className="space-y-4 max-w-sm mx-auto">
                    {authError && (
                      <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authMessage && (
                      <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{authMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      {/* Apple-style Grouped Input Container */}
                      <div className="rounded-2xl border border-white/15 bg-white/[0.04] overflow-hidden focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/25 transition-all shadow-inner">
                        <div className="relative border-b border-white/10">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full px-4 py-3.5 text-sm bg-transparent text-white placeholder-slate-400 outline-none"
                          />
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3.5 text-sm bg-transparent text-white placeholder-slate-400 outline-none pr-12"
                          />
                          {/* Apple-style Circle Arrow Submit Button */}
                          <button
                            type="submit"
                            disabled={authLoading || !email || !password}
                            className="absolute right-2.5 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-500/25"
                            title={authMode === 'signin' ? 'Sign In' : 'Create Account'}
                          >
                            {authLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                            ) : (
                              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mode Switcher */}
                      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                            clearError();
                          }}
                          className="hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {authMode === 'signin'
                            ? "Don't have an account? Create one"
                            : 'Already have an account? Sign in'}
                        </button>
                      </div>
                    </form>

                    {/* Apple Style "or" Divider */}
                    <div className="relative my-3 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <span className="relative px-3 bg-[#1C1C1E] text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        or continue with
                      </span>
                    </div>

                    {/* Apple-style Google OAuth Pill Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setAuthLoading(true);
                        clearError();
                        try {
                          await signInWithGoogle();
                        } finally {
                          setAuthLoading(false);
                        }
                      }}
                      disabled={authLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.08] border border-white/15 text-white font-medium text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:border-white/25 disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: HEALTH & VULNERABILITY PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-emerald-400" />
                      <span>Personal Vulnerability Parameters</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tailors the 3D environmental risk engine and clinical advisory generation.
                    </p>
                  </div>

                  {isAuthenticated && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Cloud Sync On
                    </span>
                  )}
                </div>

                {/* Quick Presets (Apple Health Style Tiles) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Quick Profile Presets:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                              : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-300'
                          }`}
                        >
                          <div className="font-bold text-white truncate">{preset.name}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.badge}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Age Group */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Age Group
                      </label>
                      <select
                        value={formData.ageGroup}
                        onChange={(e) =>
                          setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                      >
                        {AGE_GROUPS.map((a) => (
                          <option key={a} value={a} className="bg-slate-900 text-white">
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Occupation / Exposure */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Occupation / Daily Exposure
                      </label>
                      <select
                        value={formData.occupation}
                        onChange={(e) =>
                          setFormData({ ...formData, occupation: e.target.value as Occupation })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                      >
                        {OCCUPATIONS.map((o) => (
                          <option key={o} value={o} className="bg-slate-900 text-white">
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Outdoor Activity Level
                    </label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                    >
                      {ACTIVITY_LEVELS.map((act) => (
                        <option key={act} value={act} className="bg-slate-900 text-white">
                          {act}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Health Conditions */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-medium text-slate-300">
                      Pre-existing Conditions (Multi-select)
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
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold shadow-sm'
                                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                            }`}
                          >
                            <span className="truncate">{cond}</span>
                            {isChecked && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {isAuthenticated
                        ? 'Saves to Supabase PostgreSQL & recalculates risk.'
                        : 'Saves locally & recalculates risk.'}
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
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
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
