import React from 'react';
import { RiskLevel, SeverityLevel } from '../../types/agri';

interface RiskBadgeProps {
  level: RiskLevel | SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  className = '',
  showDot = true,
}) => {
  const norm = (level || '').toUpperCase();

  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotClass = 'bg-emerald-500';

  if (norm === 'CRITICAL' || norm === 'CRITICAL') {
    bgClass = 'bg-red-50 text-red-700 border-red-200';
    dotClass = 'bg-red-500 animate-pulse';
  } else if (norm === 'HIGH') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    dotClass = 'bg-amber-500';
  } else if (norm === 'MODERATE' || norm === 'MILD') {
    bgClass = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    dotClass = 'bg-yellow-500';
  } else if (norm === 'LOW' || norm === 'HEALTHY') {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotClass = 'bg-emerald-500';
  }

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      id={`risk-badge-${norm.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClass} whitespace-nowrap tracking-wide uppercase ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />}
      {level}
    </span>
  );
};
