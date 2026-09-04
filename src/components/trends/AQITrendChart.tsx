import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { DailyTrendPoint } from '../../types/trends';

interface AQITrendChartProps {
  data: DailyTrendPoint[];
}

export const AQITrendChart: React.FC<AQITrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="currentColor"
            className="text-slate-400 text-xs"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            className="text-slate-400 text-xs"
            tickLine={false}
            axisLine={false}
            domain={[0, 300]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: 'rgba(51, 65, 85, 0.8)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            }}
            formatter={(value: any, name: any) => {
              if (name === 'aqi') return [`${value} AQI`, 'Air Quality Index'];
              if (name === 'pm25') return [`${value} µg/m³`, 'PM2.5'];
              return [value, name];
            }}
            labelFormatter={(label) => `Day: ${label}`}
          />
          {/* Reference thresholds */}
          <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Good', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Unhealthy for Sensitive', fill: '#f97316', fontSize: 10, position: 'insideTopRight' }} />

          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#f97316"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#aqiGradient)"
            activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
