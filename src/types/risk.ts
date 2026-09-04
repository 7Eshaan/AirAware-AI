export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface RiskCategoryResult {
  level: RiskLevel;
  score: number; // 0 - 100
  title: string;
  contributingFactors: string[];
  primaryConcern: string;
}

export interface RiskAssessmentData {
  pollutionRisk: RiskLevel;
  heatRisk: RiskLevel;
  uvRisk: RiskLevel;
  overallRisk: RiskLevel;
  details: {
    pollution: RiskCategoryResult;
    heat: RiskCategoryResult;
    uv: RiskCategoryResult;
    overall: RiskCategoryResult;
  };
  calculatedAt: string;
}
