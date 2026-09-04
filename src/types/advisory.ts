export interface AIAdvisory {
  headline: string;
  summary: string;
  recommendedActions: string[];
  considerAvoiding: string[];
  safeOutdoorWindows: string[];
  hydrationTargetLiters: number;
  maskRecommendation: 'None' | 'Recommended' | 'Mandatory N95/FFP2';
  generatedAt: string;
  modelIdentifier: string;
  confidenceScore: number;
}
