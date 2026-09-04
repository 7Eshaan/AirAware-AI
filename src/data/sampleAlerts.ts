import { PersonalizedAlert } from '../types/alert';

export const INITIAL_ALERTS: PersonalizedAlert[] = [
  {
    id: 'alert-1',
    title: 'High Pollution Risk Detected',
    category: 'Pollution',
    riskLevel: 'High',
    message: 'Your personalized pollution risk increased due to elevated PM2.5 levels (62 µg/m³). With asthma recorded in your profile, limit prolonged outdoor exposure.',
    actionPrompt: 'Wear an N95 mask if commuting during peak traffic hours.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // ~2 hours ago today
    isRead: false,
  },
  {
    id: 'alert-2',
    title: 'Moderate Heat Advisory',
    category: 'Heat',
    riskLevel: 'Moderate',
    message: 'High temperature (32°C, feels like 35°C) combined with your outdoor occupation may increase heat stress and dehydration risk.',
    actionPrompt: 'Schedule 10-minute shade breaks every hour and maintain active hydration.',
    timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday afternoon
    isRead: true,
  },
  {
    id: 'alert-3',
    title: 'Elevated UV Index Alert',
    category: 'UV',
    riskLevel: 'High',
    message: 'UV Index peaked at 6.8 between 11:30 AM and 2:30 PM. Sun protection is recommended for all outdoor activities exceeding 20 minutes.',
    actionPrompt: 'Apply SPF 30+ sunscreen and wear UV-blocking sunglasses.',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    isRead: true,
  },
  {
    id: 'alert-4',
    title: 'Compound Vulnerability Warning',
    category: 'Compound',
    riskLevel: 'Very High',
    message: 'Simultaneous spike in coarse PM10 dust and high heat index detected. Synergistic stress can aggravate bronchial pathways.',
    actionPrompt: 'Shift high-exertion tasks indoors where air filtration is available.',
    timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), // 3 days ago
    isRead: true,
  },
  {
    id: 'alert-5',
    title: 'Morning Favorable Window',
    category: 'Weather',
    riskLevel: 'Low',
    message: 'Cooler morning temperatures and improved air circulation provided a safe window for outdoor exercise between 6:00 AM - 8:00 AM.',
    actionPrompt: 'Best window achieved.',
    timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString(), // 4 days ago
    isRead: true,
  },
];
