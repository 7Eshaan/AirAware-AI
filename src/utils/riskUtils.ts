import { RiskLevel } from '../types/risk';

export interface RiskLevelStyle {
  level: RiskLevel;
  bgLight: string;
  bgDark: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  borderClass: string;
  textColor: string;
  dotColor: string;
  glowColor: string;
}

export const RISK_STYLES: Record<RiskLevel, RiskLevelStyle> = {
  Low: {
    level: 'Low',
    bgLight: 'bg-emerald-500/10',
    bgDark: 'dark:bg-emerald-500/15',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800',
    borderClass: 'border-emerald-200 dark:border-emerald-900',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    glowColor: 'shadow-emerald-500/20',
  },
  Moderate: {
    level: 'Moderate',
    bgLight: 'bg-amber-500/10',
    bgDark: 'dark:bg-amber-500/15',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
    borderClass: 'border-amber-200 dark:border-amber-900',
    textColor: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
    glowColor: 'shadow-amber-500/20',
  },
  High: {
    level: 'High',
    bgLight: 'bg-orange-500/10',
    bgDark: 'dark:bg-orange-500/15',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/70',
    badgeText: 'text-orange-800 dark:text-orange-300',
    badgeBorder: 'border-orange-300 dark:border-orange-800',
    borderClass: 'border-orange-200 dark:border-orange-900',
    textColor: 'text-orange-600 dark:text-orange-400',
    dotColor: 'bg-orange-500',
    glowColor: 'shadow-orange-500/20',
  },
  'Very High': {
    level: 'Very High',
    bgLight: 'bg-rose-500/10',
    bgDark: 'dark:bg-rose-500/15',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/70',
    badgeText: 'text-rose-800 dark:text-rose-300',
    badgeBorder: 'border-rose-300 dark:border-rose-800',
    borderClass: 'border-rose-200 dark:border-rose-900',
    textColor: 'text-rose-600 dark:text-rose-400',
    dotColor: 'bg-rose-500',
    glowColor: 'shadow-rose-500/20',
  },
};

export function getRiskStyle(level: RiskLevel): RiskLevelStyle {
  return RISK_STYLES[level] || RISK_STYLES.Low;
}
