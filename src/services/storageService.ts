import { UserHealthProfile } from '../types/profile';
import { PersonalizedAlert } from '../types/alert';
import { DEFAULT_USER_PROFILE } from '../data/sampleData';
import { INITIAL_ALERTS } from '../data/sampleAlerts';

const PROFILE_KEY = 'airaware_user_profile';
const ALERTS_KEY = 'airaware_alerts_history';

/**
 * Phase 5 Service: Local Persistence for Profile & Alerts History
 */
export const storageService = {
  loadProfile(): UserHealthProfile {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored profile, using default', e);
    }
    return DEFAULT_USER_PROFILE;
  },

  saveProfile(profile: UserHealthProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  loadAlerts(): PersonalizedAlert[] {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse alerts, using default', e);
    }
    return INITIAL_ALERTS;
  },

  saveAlerts(alerts: PersonalizedAlert[]): void {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts to localStorage', e);
    }
  },

  addAlert(alert: PersonalizedAlert): PersonalizedAlert[] {
    const current = this.loadAlerts();
    const updated = [alert, ...current];
    this.saveAlerts(updated);
    return updated;
  },
};
