import { useState, useCallback } from 'react';
import { UserHealthProfile, ProfilePreset } from '../types/profile';
import { storageService } from '../services/storageService';
import { PROFILE_PRESETS } from '../data/sampleData';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserHealthProfile>(() => storageService.loadProfile());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('asthmatic-worker');

  const updateProfile = useCallback((newProfile: UserHealthProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
    setIsSaved(true);
    setActivePresetId(null);
    setTimeout(() => setIsSaved(false), 2500);
  }, []);

  const applyPreset = useCallback((preset: ProfilePreset) => {
    setProfile(preset.profile);
    storageService.saveProfile(preset.profile);
    setActivePresetId(preset.id);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  }, []);

  return {
    profile,
    updateProfile,
    applyPreset,
    activePresetId,
    presets: PROFILE_PRESETS,
    isSaved,
  };
}
