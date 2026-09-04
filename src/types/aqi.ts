export type AQICategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface PollutantDetail {
  code: 'pm25' | 'pm10' | 'no2' | 'o3' | 'co' | 'so2' | 'nh3' | 'dust';
  name: string;
  chemicalFormula: string;
  value: number;
  unit: string;
  standardLimit: number;    // WHO or EPA standard threshold
  status: 'Good' | 'Moderate' | 'Elevated' | 'High' | 'Hazardous';
  description: string;
}

export interface AQIData {
  aqi: number;              // US EPA AQI
  category: AQICategory;
  statusColor: string;
  dominantPollutant: string;
  summary: string;
  europeanAqi?: number;     // European EAQI
  europeanCategory?: string;
  pollutants: {
    pm25: PollutantDetail;
    pm10: PollutantDetail;
    no2: PollutantDetail;
    o3: PollutantDetail;
    co?: PollutantDetail;
    so2?: PollutantDetail;
    nh3?: PollutantDetail;
    dust?: PollutantDetail;
  };
  lastUpdated: string;
}

