import { AQICategory } from '../types/aqi';

export interface AQILevelInfo {
  category: AQICategory;
  range: [number, number];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  healthImplication: string;
  cautionaryStatement: string;
}

export const AQI_LEVELS: AQILevelInfo[] = [
  {
    category: 'Good',
    range: [0, 50],
    color: '#10b981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    healthImplication: 'Air quality is satisfactory, posing little or no health risk.',
    cautionaryStatement: 'Enjoy your normal outdoor activities.',
  },
  {
    category: 'Moderate',
    range: [51, 100],
    color: '#f59e0b',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    textColor: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    healthImplication: 'Air quality is acceptable; however, a small number of sensitive individuals may experience mild symptoms.',
    cautionaryStatement: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
  },
  {
    category: 'Unhealthy for Sensitive Groups',
    range: [101, 150],
    color: '#f97316',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800/60',
    textColor: 'text-orange-700 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/60',
    badgeText: 'text-orange-800 dark:text-orange-300',
    healthImplication: 'Members of sensitive groups (asthma, heart disease, children, elderly) may experience health effects.',
    cautionaryStatement: 'Sensitive groups should reduce prolonged or heavy outdoor exertion.',
  },
  {
    category: 'Unhealthy',
    range: [151, 200],
    color: '#ef4444',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800/60',
    textColor: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/60',
    badgeText: 'text-rose-800 dark:text-rose-300',
    healthImplication: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
    cautionaryStatement: 'Everyone should limit prolonged outdoor exertion; sensitive groups should avoid outdoor exertion.',
  },
  {
    category: 'Very Unhealthy',
    range: [201, 300],
    color: '#8b5cf6',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    textColor: 'text-purple-700 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    healthImplication: 'Health alert: The risk of health effects is increased for everyone in the population.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, should avoid all outdoor exertion.',
  },
  {
    category: 'Hazardous',
    range: [301, 500],
    color: '#881337',
    bgColor: 'bg-red-950/20 dark:bg-red-950/70',
    borderColor: 'border-red-900 dark:border-red-800',
    textColor: 'text-red-900 dark:text-red-400',
    badgeBg: 'bg-red-900/20 dark:bg-red-900/50',
    badgeText: 'text-red-900 dark:text-red-300',
    healthImplication: 'Health warning of emergency conditions: Everyone is more likely to be severely affected.',
    cautionaryStatement: 'Everyone should remain indoors and keep activity levels low.',
  },
];

export function getAQIInfo(aqi: number): AQILevelInfo {
  const found = AQI_LEVELS.find((l) => aqi >= l.range[0] && aqi <= l.range[1]);
  return found || AQI_LEVELS[AQI_LEVELS.length - 1];
}

export function getAQIPercentage(aqi: number): number {
  // Clamp between 0 and 500 -> returns percentage 0 - 100
  const clamped = Math.min(Math.max(aqi, 0), 500);
  return Math.round((clamped / 500) * 100);
}
