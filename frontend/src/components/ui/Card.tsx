import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'card',
        hover && 'card-hover',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Stat Card component
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  trend,
  className,
}) => {
  return (
    <div className={clsx('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="stat-icon">{icon}</div>
        {trend && (
          <span
            className={clsx(
              'text-sm font-medium',
              trend.isUp ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

export default Card;



