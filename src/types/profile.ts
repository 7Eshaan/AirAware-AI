export type AgeGroup = 'Child' | 'Teen' | 'Adult' | 'Senior Citizen';

export type HealthCondition = 
  | 'No Known Condition' 
  | 'Asthma' 
  | 'Respiratory Condition' 
  | 'Heart Condition' 
  | 'Allergy';

export type Occupation = 
  | 'Indoor Worker' 
  | 'Outdoor Worker' 
  | 'Student' 
  | 'Athlete' 
  | 'Delivery Worker' 
  | 'Construction Worker';

export type ActivityLevel = 
  | 'Mostly Indoors' 
  | 'Regular Commuting' 
  | 'Outdoor Exercise' 
  | 'Heavy Outdoor Work';

export interface UserHealthProfile {
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  occupation: Occupation;
  activityLevel: ActivityLevel;
  notificationPreferences?: {
    highRiskAlerts: boolean;
    dailyDigest: boolean;
  };
}

export interface ProfilePreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  profile: UserHealthProfile;
}
