import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield } from 'lucide-react';
import { UserHealthProfile } from '../../types/profile';

interface ProfileButtonProps {
  profile: UserHealthProfile;
  onClick: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ profile, onClick }) => {
  const hasConditions = profile.healthConditions.some((c) => c !== 'No Known Condition');

  return (
    <motion.button
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
      onClick={onClick}
      className="fixed top-6 right-6 z-30 flex items-center gap-2.5 p-2.5 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-950/70 hover:bg-slate-900/90 text-white border border-white/15 backdrop-blur-xl shadow-2xl transition-all duration-200 cursor-pointer group hover:scale-105"
      aria-label="Open Health Profile"
      title="Personal Health Profile & Exposure Settings"
    >
      <div className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
        <User className="h-4 w-4" />
        {hasConditions && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
      </div>

      <div className="hidden sm:block text-left pr-1">
        <div className="text-xs font-bold text-white leading-none">
          Health Profile
        </div>
        <div className="text-[10px] text-emerald-400 font-medium truncate max-w-[120px]">
          {profile.occupation}
        </div>
      </div>
    </motion.button>
  );
};
