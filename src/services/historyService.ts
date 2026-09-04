import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AIAdvisory } from '../types/advisory';

export interface AdvisoryHistoryRecord {
  id: string;
  user_id?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparent_temperature?: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  precipitation?: number;
  aqi: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  co?: number;
  so2?: number;
  pollution_risk?: string;
  heat_risk?: string;
  uv_risk?: string;
  overall_risk?: string;
  advisory: AIAdvisory;
  created_at: string;
}

const LOCAL_HISTORY_KEY = 'airaware_local_advisory_history';

function getLocalHistory(): AdvisoryHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(records: AdvisoryHistoryRecord[]): void {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(records.slice(0, 30)));
  } catch (e) {
    console.warn('Failed to persist local advisory history', e);
  }
}

/**
 * Saves an advisory record to Supabase (if authenticated) and to local cache.
 */
export async function recordAdvisoryHistory(
  record: Omit<AdvisoryHistoryRecord, 'id' | 'created_at'>
): Promise<AdvisoryHistoryRecord> {
  const newRecord: AdvisoryHistoryRecord = {
    ...record,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  // Always update local cache for instant UI feedback
  const localList = getLocalHistory();
  saveLocalHistory([newRecord, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('advisory_history')
          .insert({
            user_id: session.user.id,
            location_name: record.location_name,
            latitude: record.latitude,
            longitude: record.longitude,
            temperature: record.temperature,
            apparent_temperature: record.apparent_temperature,
            humidity: record.humidity,
            wind_speed: record.wind_speed,
            uv_index: record.uv_index,
            precipitation: record.precipitation,
            aqi: record.aqi,
            pm25: record.pm25,
            pm10: record.pm10,
            no2: record.no2,
            o3: record.o3,
            co: record.co,
            so2: record.so2,
            pollution_risk: record.pollution_risk,
            heat_risk: record.heat_risk,
            uv_risk: record.uv_risk,
            overall_risk: record.overall_risk,
            advisory: record.advisory,
          })
          .select()
          .single();

        if (!error && data) {
          return data as AdvisoryHistoryRecord;
        }
      }
    } catch (e) {
      console.warn('Could not save advisory to Supabase:', e);
    }
  }

  return newRecord;
}

/**
 * Fetches recent advisory history for the current user.
 */
export async function fetchUserAdvisoryHistory(limit: number = 20): Promise<AdvisoryHistoryRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('advisory_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return data as AdvisoryHistoryRecord[];
        }
      }
    } catch (e) {
      console.warn('Failed to fetch from Supabase advisory_history, falling back to local storage:', e);
    }
  }

  return getLocalHistory().slice(0, limit);
}

/**
 * Deletes an advisory history entry.
 */
export async function deleteAdvisoryHistoryRecord(id: string): Promise<boolean> {
  const localList = getLocalHistory().filter((r) => r.id !== id);
  saveLocalHistory(localList);

  if (isSupabaseConfigured() && !id.startsWith('local-')) {
    try {
      const { error } = await supabase.from('advisory_history').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  return true;
}
