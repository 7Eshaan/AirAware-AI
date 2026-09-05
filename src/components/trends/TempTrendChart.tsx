import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailyTrendPoint } from '../../types/trends';

interface TempTrendChartProps {
  data: DailyTrendPoint[];
}

export const TempTrendChart: React.FC<TempTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-52 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            domain={['dataMin - 3', 'dataMax + 3']}
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
              if (name === 'tempMax') return [`${value}°C`, 'Max Temp'];
              if (name === 'tempMin') return [`${value}°C`, 'Min Temp'];
              if (name === 'humidity') return [`${value}%`, 'Humidity'];
              return [value, name];
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="tempMax"
            name="Max Temp (°C)"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 4, fill: '#f59e0b' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="tempMin"
            name="Min Temp (°C)"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#3b82f6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
