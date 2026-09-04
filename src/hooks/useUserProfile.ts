import { useState, useCallback, useEffect, useRef } from 'react';
import { UserHealthProfile, ProfilePreset } from '../types/profile';
import { storageService } from '../services/storageService';
import { PROFILE_PRESETS } from '../data/sampleData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserHealthProfile>(() => storageService.loadProfile());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('asthmatic-worker');

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Sync with Supabase on mount and on auth state change
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    async function loadFromSupabase() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setIsSyncing(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && data && isMounted) {
            const loaded: UserHealthProfile = {
              ageGroup: data.age_group || 'Adult',
              healthConditions: Array.isArray(data.health_conditions) ? data.health_conditions : ['No Known Condition'],
              occupation: data.occupation || 'Indoor Worker',
              activityLevel: data.activity_level || 'Mostly Indoors',
            };
            setProfile(loaded);
            storageService.saveProfile(loaded);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile from Supabase:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadFromSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setIsSyncing(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && data) {
            const loaded: UserHealthProfile = {
              ageGroup: data.age_group || 'Adult',
              healthConditions: Array.isArray(data.health_conditions) ? data.health_conditions : ['No Known Condition'],
              occupation: data.occupation || 'Indoor Worker',
              activityLevel: data.activity_level || 'Mostly Indoors',
            };
            setProfile(loaded);
            storageService.saveProfile(loaded);
          } else {
            // New user without profile row: push current local profile
            const currentProf = profileRef.current;
            await supabase.from('profiles').upsert({
              id: session.user.id,
              age_group: currentProf.ageGroup,
              health_conditions: currentProf.healthConditions,
              occupation: currentProf.occupation,
              activity_level: currentProf.activityLevel,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Error synchronizing profile upon auth change:', e);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const syncToCloud = useCallback(async (updated: UserHealthProfile) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsSyncing(true);
        await supabase.from('profiles').upsert({
          id: session.user.id,
          age_group: updated.ageGroup,
          health_conditions: updated.healthConditions,
          occupation: updated.occupation,
          activity_level: updated.activityLevel,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Failed to sync profile update to Supabase:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateProfile = useCallback(
    (newProfile: UserHealthProfile) => {
      setProfile(newProfile);
      storageService.saveProfile(newProfile);
      setIsSaved(true);
      setActivePresetId(null);
      syncToCloud(newProfile);
      setTimeout(() => setIsSaved(false), 2500);
    },
    [syncToCloud]
  );

  const applyPreset = useCallback(
    (preset: ProfilePreset) => {
      setProfile(preset.profile);
      storageService.saveProfile(preset.profile);
      setActivePresetId(preset.id);
      setIsSaved(true);
      syncToCloud(preset.profile);
      setTimeout(() => setIsSaved(false), 2500);
    },
    [syncToCloud]
  );

  return {
    profile,
    updateProfile,
    applyPreset,
    activePresetId,
    presets: PROFILE_PRESETS,
    isSaved,
    isSyncing,
  };
}
