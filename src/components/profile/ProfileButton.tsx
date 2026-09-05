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
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
      onClick={onClick}
      className="relative flex items-center gap-2.5 h-10 sm:h-12 px-2 sm:px-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/15 backdrop-blur-xl shadow-2xl transition-all duration-200 cursor-pointer group hover:scale-105 shrink-0"
      aria-label="Open Health Profile"
      title="Personal Health Profile & Exposure Settings"
    >
      <div className="relative flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
