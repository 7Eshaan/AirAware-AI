import React from 'react';
import { RiskLevel } from '../../types/risk';
import { getRiskStyle } from '../../utils/riskUtils';
import { cn } from '../../utils/cn';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showDot = true,
  className,
}) => {
  const style = getRiskStyle(level);

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold tracking-wider',
    md: 'text-xs px-2.5 py-1 font-bold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border uppercase shadow-sm',
        style.badgeBg,
        style.badgeText,
        style.badgeBorder,
        sizeStyles[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            style.dotColor,
            level === 'High' || level === 'Very High' ? 'animate-pulse' : ''
          )}
        />
      )}
      <span>{level}</span>
    </span>
  );
};
