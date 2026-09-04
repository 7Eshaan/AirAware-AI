import React from 'react';
import { Wind, ShieldCheck, Heart } from 'lucide-react';
import { PageId } from '../navbar/Navbar';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-600 text-white">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                AirAware AI
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalized Weather & Air Quality Health Advisory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Alert History
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Methodology & Roadmap
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span>Built for environmental health awareness</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
