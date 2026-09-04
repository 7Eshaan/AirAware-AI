import { RiskLevel } from './risk';

export interface PersonalizedAlert {
  id: string;
  title: string;
  category: 'Pollution' | 'Heat' | 'UV' | 'Compound' | 'Weather';
  riskLevel: RiskLevel;
  message: string;
  actionPrompt?: string;
  timestamp: string;
  isRead?: boolean;
}
