import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Tabs, TabItem } from '../common/Tabs';
import { AQITrendChart } from './AQITrendChart';
import { TempTrendChart } from './TempTrendChart';
import { RiskTrendChart } from './RiskTrendChart';
import { SevenDayTrendsData } from '../../types/trends';
import { BarChart3, Wind, Thermometer, Activity } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TrendsSectionProps {
  trends: SevenDayTrendsData;
}

export const TrendsSection: React.FC<TrendsSectionProps> = ({ trends }) => {
  const [activeTab, setActiveTab] = useState<string>('aqi');

  const tabs: TabItem[] = [
    { id: 'aqi', label: 'AQI & Pollutants', icon: <Wind className="h-3.5 w-3.5 text-orange-500" /> },
    { id: 'temperature', label: 'Temperature & Humidity', icon: <Thermometer className="h-3.5 w-3.5 text-amber-500" /> },
    { id: 'risk', label: 'Personal Risk Forecast', icon: <Activity className="h-3.5 w-3.5 text-rose-500" /> },
  ];

  return (
    <Card variant="elevated" className="space-y-5">
      {/* Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Environmental Trends
            </h2>
            <Badge variant="outline" size="sm">
              7-Day Rolling History
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical environmental shifts and personalized vulnerability trajectory for {trends.locationName}
          </p>
        </div>

        {/* Tab Controls */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Dynamic Active Chart */}
      <div className="pt-2">
        {activeTab === 'aqi' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
              <span>Past 7 days Air Quality Index (PM2.5 primary)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Peak: 154 AQI (Thursday)
              </span>
            </div>
            <AQITrendChart data={trends.points} />
          </div>
        )}

        {activeTab === 'temperature' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
              <span>Past 7 days Daytime High / Nighttime Low (°C)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Weekly Average: 32.4°C
              </span>
            </div>
            <TempTrendChart data={trends.points} />
          </div>
        )}

        {activeTab === 'risk' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
              <span>Personalized health vulnerability index (0 = Low, 100 = Critical)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Today: 71/100 (High)
              </span>
            </div>
            <RiskTrendChart data={trends.points} />
          </div>
        )}
      </div>
    </Card>
  );
};
