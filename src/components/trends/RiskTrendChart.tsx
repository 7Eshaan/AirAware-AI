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

interface RiskTrendChartProps {
  data: DailyTrendPoint[];
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-52 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
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
            domain={[0, 100]}
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
            formatter={(value: any, name: any, item: any) => {
              const level = item.payload.personalRiskLevel;
              return [`${value}/100 (${level})`, 'Personal Risk Index'];
            }}
          />
          {/* Risk Level Thresholds */}
          <ReferenceLine y={35} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Low Risk', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate Risk', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'High Risk', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />

          <Area
            type="monotone"
            dataKey="personalRiskScore"
            stroke="#ef4444"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#riskGradient)"
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
